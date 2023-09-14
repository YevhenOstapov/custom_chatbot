import { FC, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LayoutGrid, List, SearchIcon } from "lucide-react";
import NoteCard from "../components/NoteCard";
import { Textarea } from "./ui/textarea";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import useSWRInfinite from "swr/infinite";
import useScrollBlock from "@/lib/hooks/useScrollBlock";
import useDisclosure from "@/lib/hooks/useDisclosure";
import Drawer from "./Drawer";
import { SheetFooter } from "./ui/sheet";
import { BsSearch } from "react-icons/bs";
const fetcher = (url) => fetch(url).then((res) => res.json());

interface IAllNotesProps {}

const AllNotes: FC<IAllNotesProps> = ({}) => {
  const [blockScroll, allowScroll] = useScrollBlock();
  const supabaseClient = useSupabaseClient();
  const [viewMode, setViewMode] = useState("list");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expandedNote, setExpandedNote] = useState(null);

  const user = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const PAGE_SIZE = 20;

  const { data, mutate, size, setSize, isValidating, isLoading } =
    useSWRInfinite(
      (index) =>
        `/api/notes?user_id=${
          user.id
        }&page_size=${PAGE_SIZE}&page=${index}&search_term=${encodeURIComponent(
          searchTerm,
        )}`,
      fetcher,
    );

  const notes = data ? [].concat(...data) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
  const isRefreshing = isValidating && data && data.length === size;

  const onEditClick = (noteId, noteContent) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(noteContent);
    onOpen();
  };

  const handleNoteEdit = async () => {
    try {
    setLoading(true);
      const { data, error } = await supabaseClient
        .from("notes")
        .update({ content: editingNoteContent })
        .eq("id", editingNoteId);
        
    if (error) throw error;
        
      // fetchNotes(true);
    } catch (error) {
      console.error("Error editing note:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleNoteDelete = async (noteId) => {
    try {
      setLoading(true);

      // Delete the associated embeddings first
      const { error: embeddingError } = await supabaseClient
        .from("embeddings")
        .delete()
        .eq("note_id", noteId);

      if (embeddingError) {
        throw embeddingError;
      }

      // Now delete the note
      const { error: noteError } = await supabaseClient
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (noteError) {
        throw noteError;
      }
    } catch (error) {
      console.error("Error deleting note and associated embeddings:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleNote = (noteId) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
  };

  useEffect(() => {
    if (!user) return;
    const subscription = supabaseClient
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Remote: INSERT:", payload.new);
          mutate();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Remote: UPDATE:", payload.new);
          mutate();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Remote: DELTE:", payload.new);
          mutate();
        },
      )
      .subscribe();

    //blockScroll();

    return () => {
      allowScroll();
      supabaseClient.removeChannel(subscription);
    };
  }, [allowScroll, mutate, supabaseClient, user]);

  useEffect(() => {
    mutate();
  }, [searchTerm]);
  return (
    <>
      <div className="flex h-9  justify-end gap-2 ">
        <div className="w-full max-w-xs pb-2 ">
          <div className="relative">
            <BsSearch className="absolute left-2 top-2.5 " />
            <Input
              placeholder="Filter notes by keyword or topic"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div className="  hidden    rounded-sm border border-gray-200 md:flex">
          <div
            onClick={() => setViewMode("grid")}
            className={`cursor-pointer px-4
            py-2
            hover:text-purple-500
         ${viewMode === "grid" ? "text-purple-500" : ""}
          `}
          >
            <LayoutGrid width="18" height="18" />
          </div>

          <div
            onClick={() => setViewMode("list")}
            className={`cursor-pointer border-l border-gray-200 px-4
            py-2
            hover:text-purple-500
            ${viewMode === "list" ? "text-purple-500" : ""}
            `}
          >
            <List width="18" height="18" />
          </div>
        </div>
      </div>
      <div>
        {viewMode === "list" ? (
          <div className="my-2 flex flex-col gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                handleNoteDelete={handleNoteDelete}
                expandedNote={expandedNote}
                onEditClick={onEditClick}
              />
            ))}
          </div>
        ) : (
          <div className="my-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                handleNoteDelete={handleNoteDelete}
                expandedNote={expandedNote}
                onEditClick={onEditClick}
              />
            ))}
          </div>
        )}
        {!isReachingEnd && !isLoadingMore && (
          <Button
            variant="ghost"
            onClick={() => setSize(size + 1)}
            className="text-md ml-3 font-bold"
          >
            Load more
          </Button>
        )}
        <Drawer isOpen={isOpen} onClose={onClose} header={"Edit Notes"}>
          <div className="flex h-full flex-col justify-between ">
            <Textarea
              value={editingNoteContent}
              onChange={(e) => setEditingNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className="mt-4  h-[calc(100vh-250px)]"
            />

            <SheetFooter className="pb-4">
              <Button
                variant="ghost"
                className="mr-3 dark:text-primary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button onClick={handleNoteEdit}>Save</Button>
            </SheetFooter>
          </div>
        </Drawer>
      </div>
    </>
  );
};
export default AllNotes;
