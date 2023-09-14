import { useState, useEffect } from "react";
import { IoSaveOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { debounce } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export default function NoteForm({ onSubmit }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(null);
  const [summary, setSummary] = useState(null);

  const API_KEY = ``;

  useEffect(() => {
    const fetchCategoryAndSummary = async () => {
      setCategory(null);
      //setSummary(null);

      if (content) {
        const DEFAULT_PARAMS = {
          model: "text-davinci-003",
          prompt:
            "Please review this text:\n\n" +
            content +
            "\n\nBased on the above text, return 2-3 category labels: [😊 Like], [😡 Dislike], Article, Reference, News, Story, Location, Recollection, Recommendation, Inspiration, Goal, Meeting, To-Do, Reminder, Learning, Quote, Health, Fitness, Travel, Shopping, Book, Movie, Review, Recipe, Food, Restaurant, Nutrition, Code, Instruction. Do not improvise or add categories that are not in the previous list." +
            "\n\nBe especially sensitive to content that could be a To-do, such as: 'call judy about the meeting', 'text john about the call', 'remember to clean the house', 'finish cleaning the windows'" +
            "\n\nIf the text does not fit one of the provided categories, return only: Note\n\nCategory:",
          temperature: 0.7,
          max_tokens: 256,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        };
        const params_ = { ...DEFAULT_PARAMS };

        try {
          const response = await fetch(
            "https://api.openai.com/v1/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: API_KEY,
              },
              body: JSON.stringify(params_),
            },
          );

          const data = await response.json();
          console.log(data);
          // Assuming the category and summary can be found in the response like this
          setCategory(data.choices[0].text);
          //setSummary(data.choices[1].text);
        } catch (error) {
          console.error(error);
        }
      }
    };

    const debouncedFetch = debounce(fetchCategoryAndSummary, 300);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [API_KEY, content]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const metadata = {
      channel: "web",
      category: category,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      location: {
        lat: null,
        lon: null,
      },
    };
    onSubmit({ content, metadata });
    setContent("");
    setCategory(null);
    setSummary(null);

    console.log(metadata);
    // Show the toast when the form is submitted
    toast("Note saved.", {
      description: "Find it later by asking Noodle.",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Toaster />
      {/* Make text area solid using tailwind css */}
      <Textarea
        rows={10}
        placeholder="Write a note..."
        className=" text-black resize-none rounded-b-none 
          border-b-0 dark:focus-visible:border-transparent
          "
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          e.target.style.height = "unset";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />

      <div className="dark:bg-red-50-700 dark:text-white rounded-b-sm bg-gray-alpha-300 p-2 dark:bg-white-400">
        <div className="flex min-w-max justify-between gap-2">
          {content &&
            category &&
            category.split(", ").map((cat, index) => (
              <motion.div
                key={index}
                animate={{
                  opacity: [0.2, 0.4, 0.6, 0.8, 0.9],
                }}
                transition={{
                  duration: 0.65,
                  times: [0, 0.25, 0.6, 0.7, 1],
                  ease: ["circOut", "circIn", "circIn", "easeOut"],
                }}
                className=" flex items-center "
              >
                <div
                  className="bg-white dark:text-black px-1 py-0.5 text-xs
                  uppercase
                  dark:bg-gray-alpha-500
                  dark:text-primary
                  "
                >
                  {cat.trim()}
                </div>
              </motion.div>
            ))}
          <div className="flex w-full justify-end ">
            <Button type="submit" className="text-md mt-1 font-bold">
              <IoSaveOutline />
              &nbsp;&nbsp;Save
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
