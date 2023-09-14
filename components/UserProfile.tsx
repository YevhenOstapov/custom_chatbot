import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const UserProfile = (props: { name: string; image: string }) => {
  const { name, image } = props;
  return (
    <div>
      <Avatar>
        <AvatarImage src={image} />
        <AvatarFallback className="text-black dark:text-white bg-gray-200 dark:bg-white-700">
          {name
            ?.split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
