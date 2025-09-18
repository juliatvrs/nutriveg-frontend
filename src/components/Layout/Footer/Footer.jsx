import { Box, Flex, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import Logo from "../Logo";
import ItemList from "../ItemList";

function Footer() {

    const footerItens = [
        {text: "Quem Somos"},
        {text: "Termos de Uso"},
        {text: "Política de Privacidade"},
        {text: "Contato"},
    ];

    const isMobile = useBreakpointValue({base: true, lg: false});

    return(
        <>
            <Flex
                as="footer"
                height={{base:"299px", lg:"249px"}} 
                width="100%"
                background="#193C40"
                align="center"
                bottom="0"
                paddingTop="82px"
                paddingBottom="82px"
            >
                <Flex
                    justify="space-between"
                    maxWidth="1440px"
                    width="100%"
                    align={"center"}
                    margin={"0 auto"}
                    paddingRight={{base:"34px", md:"72px"}} 
                    paddingLeft={{base:"34px", md:"72px"}}
                >
                    {!isMobile ? (
                        <>
                            <Box marginRight="20px">
                                <Logo/>
                            </Box>
                            <ItemList itens={footerItens}/>
                            <Stack
                                width="388px"
                                marginLeft="20px"
                            >
                                <Text
                                    color="#FFFFFF"
                                    fontWeight="bold"
                                >
                                    &copy; Copyright 2024 - Todos os direitos reservados. Proibida cópia total ou parcial sem autorização.
                                </Text>
                            </Stack>
                        </>
                    ) : (
                        <>
                           <Flex
                                width="100%"
                                height="100%"
                                direction="column"
                           >
                                <Box marginBottom="20px">
                                    <Logo/>
                                </Box>
                                <ItemList itens={footerItens}/>
                                <Text
                                    color="#FFFFFF"
                                    fontWeight="bold"
                                    marginTop="20px"
                                >
                                    &copy; Copyright 2024 - Todos os direitos reservados. Proibida cópia total ou parcial sem autorização.
                                </Text>
                           </Flex>
                        </>
                    )}
                </Flex>
            </Flex>
            <Box 
                bgGradient="linear-gradient(90deg, #193c40 0%, #2fac66 100%)"
                h="20px"
                w="100%"
            />
        </>
    );
};

export default Footer;