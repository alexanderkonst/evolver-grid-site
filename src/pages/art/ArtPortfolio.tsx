import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// Category display names
const categoryNames: Record<string, string> = {
  "ceremonial-space-designs": "CEREMONIAL SPACE DESIGNS",
  "digital-illustrations-stickers": "DIGITAL ILLUSTRATIONS & STICKERS",
  "star-code-jewellery": "STAR CODES",
  "webportals": "WEBPORTALS",
};

// Portfolio images
const categoryImages: Record<string, { src: string; caption: string }[]> = {
  "ceremonial-space-designs": [
    { src: "https://i.imgur.com/40cWWoe.jpg", caption: "" },
    { src: "https://i.imgur.com/mOcLWQa.png", caption: "" },
    { src: "https://i.imgur.com/sGuo9IQ.jpeg", caption: "" },
    { src: "https://i.imgur.com/MT6HjU5.png", caption: "" },
    { src: "https://i.imgur.com/dMUGpuE.png", caption: "" },
    { src: "https://i.imgur.com/qFWDLb5.jpeg", caption: "" },
    { src: "https://i.imgur.com/2ZqaVGq.png", caption: "" },
  ],
  "digital-illustrations-stickers": [
    { src: "https://i.imgur.com/RpmgjXZ.png", caption: "" },
    { src: "https://i.imgur.com/Q6c3UZT.png", caption: "" },
    { src: "https://i.imgur.com/pwk46QR.jpeg", caption: "" },
    { src: "https://i.imgur.com/uKLx40i.png", caption: "" },
  ],
  "star-code-jewellery": [
    { src: "https://i.imgur.com/NGSxNw8.png", caption: "" },
    { src: "https://i.imgur.com/EH24PWf.png", caption: "" },
    { src: "https://i.imgur.com/GvGtQYc.png", caption: "" },
  ],
  "webportals": [
    { src: "https://i.imgur.com/V2k7mQD.jpeg", caption: "" },
    { src: "https://i.imgur.com/z52mHde.png", caption: "" },
    { src: "https://i.imgur.com/3wd1seC.png", caption: "" },
  ],
};

const ArtPortfolio = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const categoryName = category ? categoryNames[category] || category : "";
  const images = category ? categoryImages[category] || [] : [];
  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header - higher z-index to ensure buttons are immediately clickable */}
      <header className="w-full px-4 md:px-8 py-6 flex items-center relative z-50">
        {/* Back Button */}
        <button
          onClick={() => navigate("/art")}
          className="text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity p-2 -ml-2 cursor-pointer"
          aria-label="Back to gallery"
        >
          <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
        </button>

        {/* Portfolio Title */}
        <h1 className="flex-1 text-center font-serif text-lg md:text-2xl text-[hsl(210,70%,15%)] font-normal -ml-8 md:-ml-10 uppercase">
          {categoryName} PORTFOLIO
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-16 pb-8">
        {images.length > 0 && currentImage ? (
          <div className="w-full max-w-5xl flex flex-col">
            {/* Image Container with Navigation */}
            <div className="relative flex items-center justify-center">
              {/* Left Arrow */}
              <button
                onClick={goToPrevious}
                className="absolute left-0 md:-left-16 text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity p-2 z-50 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1} />
              </button>

              {/* Image */}
              <div className="w-full aspect-[4/3] md:aspect-[16/10] bg-gray-100 flex items-center justify-center">
                {currentImage.src ? (
                  <img
                    src={currentImage.src}
                    alt={currentImage.caption || `${categoryName} artwork`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="font-serif text-[hsl(210,70%,15%)] opacity-40 text-sm">
                    Image placeholder
                  </span>
                )}
              </div>

              {/* Right Arrow */}
              <button
                onClick={goToNext}
                className="absolute right-0 md:-right-16 text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity p-2 z-50 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1} />
              </button>
            </div>

            {/* Caption - aligned with left edge of image */}
            <div className="mt-4 md:mt-6">
              <p className="font-serif text-sm md:text-base text-[hsl(210,70%,15%)] text-left">
                {currentImage.caption || "\u00A0"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p className="font-serif text-[hsl(210,70%,15%)] opacity-50">
              No images yet
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtPortfolio;
