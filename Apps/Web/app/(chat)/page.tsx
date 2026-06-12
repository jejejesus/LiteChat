import Card from "@/components/UI/Card";

export default function HomePage() {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-1/2 p-2 m-1 overflow-auto">Chat list</div>
      <div className="w-1/2  p-2 m-1 rounded-xl outer-shadow overflow-auto">
        Open chat
      </div>
    </div>
  );
}
