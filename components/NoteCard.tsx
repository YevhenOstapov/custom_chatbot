import { format, isToday, isYesterday } from "date-fns";
import { IoTrashOutline, IoCreateOutline } from "react-icons/io5";
import Linkify from "react-linkify";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
const NoteList = ({ note, handleNoteDelete, expandedNote, onEditClick }) => {
  const truncateNote = (content: string) => {
    return content.length > 100 ? content.slice(0, 500) + "..." : content;
  };

  const linkDecorator = (href: string, text: string, key: string) => (
    <a
      href={href}
      key={key}
      style={{ textDecoration: "underline" }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    let formattedDate = format(parsedDate, "p");

    if (isToday(parsedDate)) {
      return formattedDate;
    } else if (isYesterday(parsedDate)) {
      return `Yesterday ${formattedDate}`;
    } else {
      return format(parsedDate, "Pp");
    }
  };

  return (
    <Card
      key={note.id}
      className={`
        bg-gray
        group
        flex
        min-h-[120px]
        flex-col
        justify-between
       hover:bg-gray-50
       hover:pb-0
       dark:bg-[#2F3137]
       dark:hover:bg-white-50
        `}
    >
      <CardContent className="p-4 dark:text-zinc-200">
        <Linkify componentDecorator={linkDecorator}>
          {expandedNote === note.id
            ? note.content.split("\n").map((line, i) => (
                <p key={i}>
                  {line}
                  <br />
                </p>
              ))
            : truncateNote(note.content)}
        </Linkify>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="mt-3 text-gray-400">
          <sup>{formatDate(note.created_at)}</sup>
        </div>
        <div
          className="hidden
        h-5
        group-hover:flex"
        >
          <Button
            onClick={() => handleNoteDelete(note.id)}
            variant="ghost"
            className="dark:text-gray-50"
          >
            <IoTrashOutline />
          </Button>
          <Button
            className="dark:text-gray-50"
            onClick={() => onEditClick(note.id, note.content)}
            variant="ghost"
          >
            <IoCreateOutline />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteList;
