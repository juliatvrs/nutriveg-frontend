import { extendTheme } from "@chakra-ui/react";
import "@fontsource/inter";

const theme = extendTheme ({
    fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
    },

    fontWeights: {
        hairline: 300,
        thin: 300,
        light: 400,
        normal: 500,
        medium: 600,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 800,
      }, // grossura da fonte
});

export default theme;