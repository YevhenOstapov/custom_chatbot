import React, { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { streamReader } from "openai-edge-stream";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import SyncLoader from "react-spinners/SyncLoader";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

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

const AIChat = () => {
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
          ...messages,
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
    setQuery("");
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

  const linkDecorator = (href, text, key) => (
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

  const renderComponents = {
    a: ({ node, ...props }) => (
      <a
        {...props}
        style={{ textDecoration: "underline" }}
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div id="query">
          <section className="flex flex-col sm:flex-row">
            <Textarea
              disabled={loading}
              rows={3}
              placeholder="Add a note. Press '/' for commands."
              style={{ minHeight: "unset", overflow: "hidden", resize: "none", height: "150px" }} // Added resize: 'none' to prevent user from resizing
              value={query}
              onKeyPress={handleUserKeyPress}
              onChange={(e) => {
                setQuery(e.target.value);
                e.target.style.height = "unset";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
            {loading ? (
              <div className="text-white mt-8 inline-flex h-10 w-full items-center justify-center bg-purple-200 sm:w-auto">
                <Loader2
                  className=" block h-8 w-8
                     animate-spin sm:hidden"
                />
              </div>
            ) : (
              <Button
                type="submit"
                className="mt-4 block w-full font-bold sm:hidden sm:w-auto md:mt-8"
              >
                Ask
              </Button>
            )}
          </section>
        </div>
      </form>

      <div className="w-full items-start pt-8 ">
        {!isQueryExecuted ? (
          // <div>
          //   <div className="m-1 w-full">
          //     <div
          //       className="text-white flex flex-col items-start      
          //     justify-center rounded-lg border 
          //     border-gray-200 p-4
          //     shadow-sm
          //     dark:border-black-200
          //     dark:bg-[#343643]
          //     "
          //     >
          //       <h2 className="text-md text-gray-90  mb-8 font-bold dark:text-gray-100">
          //         👋&nbsp;&nbsp;Welcome Noodle tester!
          //       </h2>

          //       <div className="flex flex-col gap-2">
          //         {notes.map((note, i) => (
          //           <React.Fragment key={note.title}>
          //             {i !== 0 && <hr className="my-2" />}
          //             <div>
          //               <h3 className="text-gray-90 dark:text-white -mb-4 text-sm  font-bold dark:text-gray-100">
          //                 {note.title}
          //               </h3>
          //               {note.description &&
          //                 note.description.map((desc) => (
          //                   <p
          //                     key={desc}
          //                     className="text-black mt-4
          //                     pt-2
          //                     text-sm text-[#6B7280]"
          //                   >
          //                     {desc}
          //                   </p>
          //                 ))}
          //             </div>
          //           </React.Fragment>
          //         ))}
          //       </div>
          //     </div>
          //   </div>
          // </div>
          <></>
        ) : (
          // Render your messages here when a query has been executed
          <>
            {isLoadingAIResponse && (
              <div
                className=" pb-5
             pt-2
              "
              >
                <SyncLoader
                  color={
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.5)"
                  }
                  size={8}
                />
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`
                  ${
                    message.type === "user"
                      ? "text-md  my-2 inline-block bg-gray-100 !px-3 !py-2 font-medium  text-gray-700  dark:text-gray-800  "
                      : "prose font-normal text-gray-700  prose-code:text-purple-800 prose-pre:bg-purple-100 dark:text-gray-200  "
                  } rounded-sm px-3 py-[1px] 
                  `}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  );
};

export default AIChat;
