import { Link } from "react-router-dom";
import ArtAudioToggle from "@/components/art/ArtAudioToggle";

const categories = [
  { id: "ceremonial-space-designs", label: "CEREMONIAL SPACE DESIGNS" },
  { id: "digital-illustrations-stickers", label: "DIGITAL ILLUSTRATIONS & STICKERS" },
  { id: "star-code-jewellery", label: "STAR CODE JEWELLERY" },
  { id: "webportals", label: "WEBPORTALS" },
];

const ArtGallery = () => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative px-6 py-12"
      style={{
        backgroundImage: "url('https://i.imgur.com/LmAgOfb.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* White overlay for subtlety */}
      <div className="absolute inset-0 bg-white/85" />
      
      {/* Audio Toggle */}
      <ArtAudioToggle />

      {/* Hero Section */}
      <div className="flex flex-col items-center mb-16 text-center max-w-2xl">
        <h1 className="font-serif text-4xl md:text-6xl text-[hsl(210,70%,15%)] mb-6">
          АРХАЗМ ART
        </h1>
        <img
          src="https://i.imgur.com/ArTfs8d.jpg"
          alt="Arkhazm"
          className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover mb-6"
        />
        <p className="font-serif text-base md:text-lg text-[hsl(210,70%,15%)] uppercase">
          A designer of the Golden Age: synthesizing sacred, digital, and physical into simple multidimensional art forms
        </p>
      </div>

      {/* Category Links */}
      <nav className="flex flex-col items-center gap-8 md:gap-10">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/art/${category.id}`}
            className="font-serif text-lg md:text-2xl text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity duration-300 underline underline-offset-4 decoration-1"
          >
            {category.label}
          </Link>
        ))}
        {/* Contact link */}
        <a
          href="https://t.me/integralevolution"
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif text-lg md:text-2xl text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity duration-300 underline underline-offset-4 decoration-1"
        >
          CONTACT MY TEAM
        </a>
      </nav>
    </div>
  );
};

export default ArtGallery;
