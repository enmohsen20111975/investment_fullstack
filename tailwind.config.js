/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./frontend/**/*.html",
        "./frontend/**/*.js",
    ],
    theme: {
        extend: {
            colors: {
                halal: '#34a853',
                haram: '#ea4335',
                doubtful: '#fbbc04',
                primary: '#1a73e8',
                secondary: '#5f6368',
            },
            fontFamily: {
                'cairo': ['Cairo', 'sans-serif'],
            }
        }
    },
    plugins: [],
}
