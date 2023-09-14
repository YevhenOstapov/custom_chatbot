import NoteForm from "../components/NoteForm";
import AskNoodle from "../components/AskNoodle";
import NavButton from "@/components/NavButton";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiLogOut, FiSettings,FiMoon,FiSun } from "react-icons/fi";
import Image from "next/image";
import logo from "../public/images/logo_noodle.svg";
import logodark from "../public/images/logo_noodle_dark.svg";

import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AllNotes from "@/components/AllNotes";

import NewAIChat2 from "@/components/NewAIChat2";
import { MenuIcon } from "lucide-react";
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Dashboard({ session }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNoteSubmit = async (noteData) => {
    console.log(noteData);
    try {
      setLoading(true);

      const response = await fetch("/api/add_note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          content: noteData.content,
          metadata: noteData.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Error adding note");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const truncateNote = (content) => {
    return content.length > 100 ? content.slice(0, 500) + "..." : content;
  };

  const getUserInitials = (email) => {
    if (!email) return "";
    const nameParts = email.split("@")[0].split(".");
    const initials = nameParts.map((part) => part[0].toUpperCase());
    return initials.join("");
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const tabs = [
    {
      name: "Ask Noodle",
      content: <AskNoodle />,
    },
    {
      name: "Create",
      content: <NoteForm onSubmit={handleNoteSubmit} />,
    },
    {
      name: "Browse",
      content: <AllNotes />,
    },
  ];

  return (
    <>
      <div className="flexflex-col bg-background">
        <nav
          id="header"
          className="sticky top-0 z-40 flex flex-wrap  
          items-center justify-between 
          border-b border-black-100 bg-gray-alpha-100 px-2 py-3 dark:border-gray-alpha-600 dark:bg-white-300 md:px-4
          "
        >
          <div className="flex h-[40px] gap-4 ">
            <Image
              src={theme === "light" ? logo : logodark}
              alt={"Noodle Logo"}
            />

            <NewAIChat2 />
          </div>

          <div className="flex ">
            <NavButton
              icon={
                theme === "light" ? (
                  <FiMoon className="text-black h-6 w-6" />
                ) : (
                  <FiSun className="h-6 w-6 dark:text-purple-200" />
                )
              }
              onClick={
                theme === "light"
                  ? () => setTheme("dark")
                  : () => setTheme("light")
              }
              style={{marginRight: 10}}
            />
            <DropdownMenu>
              <DropdownMenuTrigger>
                {/* <UserProfile name={user?.email} image="" /> */}
                <MenuIcon className=" h-9  w-9 bg-gray-300 p-2 " style={{borderRadius: 50}}/>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative right-4 border-gray-600 dark:bg-gray-700">
                <DropdownMenuLabel className="text-md">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-md">
                  <FiSettings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-md">
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        <div>
          <div className="mx-auto w-full max-w-6xl pt-4">
            <Tabs defaultValue={tabs[0].name}>
              <TabsList>
                {tabs.map((tab, index) => {
                  return (
                    <TabsTrigger key={index} value={tab.name}>
                      {tab.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {tabs.map((tab, index) => {
                return (
                  <TabsContent
                    key={index}
                    value={tab.name}
                    className=" h-[calc(100vh-150px)] overflow-y-auto p-4"
                  >
                    {tab.content}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
