import React, { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { streamReader } from "openai-edge-stream";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import SyncLoader from "react-spinners/SyncLoader";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { IoPaperPlane } from "react-icons/io5";
import { Card } from "./ui/card";
import { PiMagicWandLight } from "react-icons/pi";
import { GoThumbsdown, GoThumbsup } from "react-icons/go";
import { MdOutlineContentCopy } from "react-icons/md";
import { AiOutlineReload } from "react-icons/ai";
const notes = [
  {
    title: "Getting started",
    description: [
      `You can get started by adding a note or two to the app in the "New note" tab, above. Feel free to be as unstructured as you'd like, and make note of anything.`,
    ],
  },
  {
    title: "How to summon notes",
    description: [
      `Noodle uses GPT-based AI in the background to find, make sense of, and summarize your notes for you. So, you should be able to be as vague or specific as you'd like when asking Noodle to recall notes.`,
      `You can also say things like "summarize my notes on x" to have Noodle look across all of your notes and reply with a summarization. You can also say things like "show me my most recent entries on x", or "as a nutritionist, summarize my recent eating habits" (just as an example — feel free to get creative!).`,
    ],
  },
  {
    title: "Feedback",
    description: [
      `A mechanism for sharing your experiences and feedback from inside the app is coming soon, but for now please continue to email us at hello@noodleai.app.`,
    ],
  },
];

const NewAIChat2 = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false);
  const [isQueryExecuted, setIsQueryExecuted] = useState(false);
  const { theme } = useTheme();
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  console.log("messages", query);

  const handleAIQueryStream = async (query) => {
    setLoading(true);
    let messageHistoryContent = "";

    console.log(query);
    try {
      // Fetch the most relevant note(s) based on the embeddings
      const response = await fetch("/api/vector_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, user_id: user.id }),
      });

      const data = await response.json();
      console.log("-------");
      console.log(data);

      if (!response.ok) {
        console.log("Response not OK: ", data);
        throw new Error(data.error);
      }

      const obj = data;
      let concatenatedContent = "";
      obj.data.forEach((item) => {
        concatenatedContent +=
          "\n\n " + formatDate(item.created_at) + ": " + item.content;
      });

      // set this to true to include the recent (current session) conversation history in the AI response
      // also a configurable flag in the profiles table under column include_conversation_history
      let include_conversation_history = false;
      if (include_conversation_history) {
        const { data: recentConversations, error: recentConversationsError } =
          await supabaseClient
            .from("conversations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

        if (recentConversationsError) {
          console.error(
            "Error fetching recent conversations:",
            recentConversationsError,
          );
          throw recentConversationsError;
        }

        recentConversations.forEach((conversation) => {
          messageHistoryContent +=
            conversation.question + " " + conversation.answer;
        });
      }

      const requestPayload = {
        concatenatedContent,
        prompt_user: query,
        // @ts-ignore
        ...(include_conversation_history && { messageHistoryContent }),
      };

      const streamResponse = await fetch("/api/openai_stream", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });
      const streamData = streamResponse.body;
      if (!streamData) return;
      // console.log("streamData" + streamData);

      const reader = streamData.getReader();
      let content = "";
      await streamReader(reader, (message) => {
        content = content + message.content;
        setMessages([
          { type: "user", content: query },
          { type: "ai", content: content },
        ]);
        setIsLoadingAIResponse(false);
      });

      // Insert a new row in the conversations table after the AI response
      const { data: conversation, error } = await supabaseClient
        .from("conversations")
        .insert([
          {
            user_id: user.id,
            question: query,
            answer: content,
          },
        ]);

      if (error) {
        console.error("Error inserting conversation: ", error);
      } else {
        console.log("Conversation inserted successfully: ", conversation);
      }
    } catch (error) {
      console.error("Error interacting with OpenAI API:", error);
      return "Sorry, I could not process your request.";
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Stop the form from causing a page refresh
    if (query.trim() === "") return;

    handleAIQueryStream(query);
    // setQuery("");
    setIsLoadingAIResponse(true);
    setIsQueryExecuted(true);
  };

  const handleUserKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Check for enter key but not with shift
      e.preventDefault(); // prevent newline
      handleSubmit(e); // pass event argument
    }
  };

  return (
    <>
      <form
        className="absolute ml-8  flex flex-col gap-2"
        id="query"
        onSubmit={handleSubmit}
      >
        <div>
          <div className="relative  bg-red-50 ">
            <Textarea
              disabled={loading}
              rows={1}
              value={query}
              style={{
                minHeight: "unset",
                overflow: "hidden",
                resize: "none",
              }}
              onKeyPress={handleUserKeyPress}
              onChange={(e) => {
                setQuery(e.target.value);
                e.target.style.height = "unset";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className={`
            bg-white
            focus-visible:bg-white
            min-h-0  min-w-full resize-none  pr-16  outline-none placeholder:text-sm
                  md:w-80
                  ${query ? "min-h-[100px] w-auto md:w-[650px]" : ""}
                  focus-visible:min-h-[100px]
                  focus-visible:border-gray-200
                  md:focus-visible:w-[650px]`}
              placeholder="Ask Noodle anything.."
            />
            <div
              className="absolute right-0 top-0 flex items-center 
          gap-2
          pr-0 active:bg-transparent"
            >
              {query && messages.length > 0 ? (
                <Button
                  onClick={() => {
                    setQuery("");
                    setIsQueryExecuted(false);
                    setMessages([]);
                  }}
                  variant="ghost"
                >
                  <X className="text-xl" />
                </Button>
              ) : (
                <>
                  <div className="hidden rounded-2xl bg-gray-200 px-[4px] text-xs md:block">
                    ⌥⌘A
                  </div>
                  <Button type="submit" variant="ghost">
                    <IoPaperPlane className="text-xl" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isLoadingAIResponse && (
          <Card className=" !bg-white  relative right-5 w-full max-w-full p-4  py-6 md:right-0 md:max-w-[650px]">
            <div className=" flex h-10  items-center ">
              <SyncLoader
                color={
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)"
                }
                size={6}
              />
            </div>
          </Card>
        )}
        {query && messages.length > 0 && (
          <Card className=" !bg-white  relative right-5 w-full max-w-full p-4  py-6 md:right-0 md:max-w-[650px]">
            <section>
              <div className="flex">
                <div className="pr-4">
                  <PiMagicWandLight className="text-2xl" />
                </div>
                <div className="full">
                  {messages.map((message, index) => {
                    if (message.type === "ai") {
                      return (
                        <div
                          key={index}
                          className="prose prose-sm w-full  rounded-sm px-3 py-[1px] font-normal text-gray-700  prose-code:text-purple-800 prose-pre:bg-purple-100 dark:text-gray-200"
                        >
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <div className="flex items-center gap-4 ">
                  <div className="flex items-center justify-between gap-4 rounded-full  border border-gray-100 px-4 py-2 text-lg">
                    <GoThumbsup />
                    <GoThumbsdown />
                  </div>
                  <div className="flex items-center justify-between  gap-2 p-2">
                    <MdOutlineContentCopy />
                    <p className="hidden md:block">Copy</p>
                  </div>
                  <div className="flex items-center justify-between  gap-2 p-2">
                    Save <span className="hidden md:block">as note</span>
                  </div>
                </div>

                <div className="flex items-center  justify-between gap-2 p-2">
                  <AiOutlineReload />
                  <p>New answer</p>
                </div>
              </div>
            </section>
          </Card>
        )}
      </form>
    </>
  );
};

export default NewAIChat2;
