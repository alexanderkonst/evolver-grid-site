import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Premium typography: Cormorant Garamond (inscribed/etched) for headings, DM Sans (clean minimal) for body
        display: ["Cormorant Garamond", "Georgia", "serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        destiny: {
          dark: "hsl(var(--destiny-dark))",
          light: "hsl(var(--destiny-light))",
          gold: "hsl(var(--destiny-gold))",
          "gold-dark": "hsl(var(--destiny-gold-dark))",
        },
        // Wabi-sabi Design System
        wabi: {
          lavender: "var(--wabi-lavender)",
          "lavender-alt": "var(--wabi-lavender-alt)",
          lilac: "var(--wabi-lilac)",
          "lilac-alt": "var(--wabi-lilac-alt)",
          blush: "var(--wabi-blush)",
          "blush-alt": "var(--wabi-blush-alt)",
          orchid: "var(--wabi-orchid)",
          "orchid-alt": "var(--wabi-orchid-alt)",
          aqua: "var(--wabi-aqua)",
          "aqua-alt": "var(--wabi-aqua-alt)",
          sage: "var(--wabi-sage)",
          champagne: "var(--wabi-champagne)",
          pearl: "var(--wabi-pearl)",
          "pearl-alt": "var(--wabi-pearl-alt)",
        },
        depth: {
          royal: "var(--depth-royal)",
          cornflower: "var(--depth-cornflower)",
          navy: "var(--depth-navy)",
          charcoal: "var(--depth-charcoal)",
          "charcoal-alt": "var(--depth-charcoal-alt)",
          violet: "var(--depth-violet)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      zIndex: {
        underlay: "-10",
        base: "0",
        above: "10",
        sticky: "20",
        fixed: "30",
        overlay: "40",
        modal: "50",
        popover: "60",
        toast: "70",
        tooltip: "80",
        cursor: "90",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
