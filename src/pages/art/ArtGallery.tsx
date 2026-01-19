import { Link } from "react-router-dom";
import ArtAudioToggle from "@/components/art/ArtAudioToggle";

const categories = [
  { id: "ceremonial-space-designs", label: "ceremonial space designs" },
  { id: "digital-illustrations", label: "digital illustrations" },
  { id: "star-code-jewellery", label: "star code jewellery" },
  { id: "webportals", label: "webportals" },
];

const ArtGallery = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      {/* Audio Toggle */}
      <ArtAudioToggle />

      {/* Category Links */}
      <nav className="flex flex-col items-center gap-8 md:gap-12">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/art/${category.id}`}
            className="font-serif text-lg md:text-2xl text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity duration-300 underline underline-offset-4 decoration-1"
          >
            {category.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ArtGallery;
