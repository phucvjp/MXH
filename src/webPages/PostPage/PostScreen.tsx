import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PostCard } from "./PostCard";
import PostService, { Post } from "@/service/PostService";
import { useQuery } from "@tanstack/react-query";
import LoadingAnimation from "@/components/ui/loadingAnimation/LoadingAnimation";
import { User } from "@/service/UserService";
import { getCookie } from "typescript-cookie";

export const PostScreen = () => {
  const postId = useParams().postId;

  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User>();

  const { isLoading, isPending, isError, data, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => PostService.getPostById(parseInt(postId || "-1")),
    retry: 1,
    retryOnMount: false,
  });

  useEffect(() => {
    if (data) {
      setPosts([data]);
      const token = localStorage.getItem("token");
      if (token && token !== "" && token !== "undefined") {
        setUser(JSON.parse(getCookie("user") ?? "{}"));
      }
    }
  }, [data]);

  if (isPending) {
    return <LoadingAnimation />;
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || error) {
    console.log(error);
    return <div>Failed to fetch post</div>;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <PostCard
        key={posts[0]?.post_id}
        i={posts[0]?.post_id}
        post={posts[0] || data}
        setPosts={setPosts}
        user={user}
      ></PostCard>
    </div>
  );
};
