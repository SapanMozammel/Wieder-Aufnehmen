/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        dm: ['var(--font-dm)'],
        eb: ['var(--font-eb)'],
        sigma: ['var(--font-sigma)'],
      },
    },
  },
  plugins: [],
};


const defaultTheme = require("tailwindcss/defaultTheme");
const svgToDataUri = require("mini-svg-data-uri");
/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: "jit",
    darkMode: "class",
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./vendor/laravel/jetstream/**/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.vue",
    ],

    theme: {
        extend: {
            backgroundImage: (theme) => ({
                "multiselect-caret": `url("${svgToDataUri(
                    `<svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.00048 3.78047L8.30048 0.480469L9.24315 1.42314L5.00048 5.6658L0.757812 1.42314L1.70048 0.480469L5.00048 3.78047Z" fill="#C1C9DE"/>
                    </svg>`
                )}")`,
                "multiselect-spinner": `url("${svgToDataUri(
                    `<svg viewBox="0 0 512 512" fill="${theme(
                        "colors.green.500"
                    )}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`
                )}")`,
                "multiselect-remove": `url("${svgToDataUri(
                    `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>`
                )}")`,
            }),
            container: {
                center: true,
            },
            screens: {
                "large-monitor": { min: "2560px" },
                monitor: { min: "2223.98px" },
                laptop: { max: "1535.98px" },
                "small-laptop": { max: "1279.98px" },
                "wide-tablet": { max: "1023.98px" },
                tablet: { max: "768.98px" },
                "wide-mobile": { max: "640.98px" },
                mobile: { max: "479.98px" },
            },
            fontFamily: {
                sans: ["DM Sans", ...defaultTheme.fontFamily.sans],
                alfa: ["Pacifico", "cursive"],
                xc: ["x-cloud-icon"],
            },
            dropShadow: {
                button: "0 0.125rem 0.125rem rgba(0, 40, 132, 0.3)",
                "grid-box": "0px 10px 50px rgba(42, 50, 104, 0.10)",
                "list-box": "0px 10px 30px rgba(42, 50, 104, 0.05)",
            },
            boxShadow: {
                sun: "0 0 0.625rem rgba(0, 40, 132, 0.125)",
                dropdown: "0 0.625rem 3.125rem rgba(0, 40, 132, 0.125)",
            },
            fontSize: {
                xxxs: ".5rem",
                xxs: ".625rem",
                "28px": "1.75rem",
                "40px": "2.5rem",
            },
            colors: {
                primary: {
                    light: "#147AFF",
                    dark: "#0F70EF",
                },
                secondary: {
                    full: "#74778E",
                    light: "#C1C9DE",
                },
                purple: "#5835C0",
                light: "#EDF2F8",
                focused: "#D7E6F9",
                dark: "#2A3268",
                danger: "#FC573B",
                warning: "#F8A643",
                failed: "#FD5A78",
                delete: "#FF674F",
                pro: "#F48626",
                success: {
                    light: "#2DC774",
                    full: "#32BA7C",
                    dark: "#0AA06E",
                },
                mode: {
                    base: "#171A30",
                    light: "#1D2239",
                    secondary: {
                        light: "#A8ACBC",
                        dark: "#A1A7BA",
                    },
                    focus: {
                        dark: "#232A4E",
                        light: "#313A6C",
                    },
                },
            },
            ringWidth: {
                1: "0.0625rem",
                2: "0.125rem",
            },
            ringOffsetWidth: {
                3: "0.1725rem",
            },
            borderWidth: {
                1: "0.0625rem",
                2: "0.125rem",
                3: "0.1875rem",
                6: "0.375rem",
            },
            borderRadius: {
                "10px": "0.625rem",
                "20px": "1.75rem",
                "25px": "1.5625rem",
            },
            spacing: {
                "2px": "0.125rem",
                "5px": "0.3125rem",
                "10px": "0.625rem",
                "15px": "0.9375rem",
                "20px": "1.25rem",
                "25px": "1.5625rem",
                "30px": "1.875rem",
                "40px": "2.5rem",
                "50px": "3.125rem",
                "60px": "3.75rem",
                "100px": "6.25rem",
                "150px": "9.375rem",
                "250px": "15.625rem",
                "400px": "28.5rem",
            },
            maxWidth: {
                "200px": "12.5rem",
                "356px": "22.25rem",
                "400px": "25rem",
                "450px": "28.125rem",
                "590px": "36.875rem",
                "850px": "53.125rem",
                "890px": "55.625rem",
                "1050px": "65.625rem",
                "1120px": "70rem",
                "1350px": "84.375rem",
                "2560px": "142.2225rem",
            },
            minWidth: {
                "2px": "0.125rem",
                "15px": "0.9375rem",
                "20px": "1.25rem",
                "25px": "1.5625rem",
                "30px": "1.875rem",
                "40px": "2.5rem",
                "50px": "3.125rem",
                "60px": "3.75rem",
                "100px": "6.25rem",
            },
            minHeight: {
                "2px": "0.125rem",
                "15px": "0.9375rem",
                "20px": "1.25rem",
                "25px": "1.5625rem",
                "30px": "1.875rem",
                "40px": "2.5rem",
                "50px": "3.125rem",
                "60px": "3.75rem",
                "70px": "4.375rem",
                "100px": "6.25rem",
            },
            maxHeight: {
                "600px": "37.5rem",
            },
            inset: {
                "10/12": "83.333333%",
            },
            divideWidth: {
                DEFAULT: "0.0625rem",
                1: "0.0625rem",
                2: "0.125rem",
            },
            zIndex: {
                1: "1",
                dropdown: "1000",
                "modal-backdrop": "9999",
                modal: "10000",
                backdrop: "99999",
                sidenote: "100000",
                header: "1000000",
            },
            transitionProperty: {
                switch: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, transform, left, right",
                sitenote: "right, margin-right, top",
            },
        },
    },
    variants: {
        extend: {},
    },

    plugins: [
        require("autoprefixer"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
    ],
};
