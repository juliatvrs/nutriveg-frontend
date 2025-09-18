import { Box, Image, Text, VStack } from "@chakra-ui/react";
import error404Image from "../assets/img/404-error.png"

function PageNotFound() {
    return (
        <>
            <Box
                marginTop="149px"
                marginBottom="74px"
                display="flex"
                justifyContent="center"
            >
                <VStack>
                    <Image src={error404Image} />
                    <Text
                        fontSize={{base:"22px", md:"36px", lg:"40px"}} 
                        fontWeight="bold"
                        align="center"
                        marginRight="10px"
                        marginLeft="10px"
                    >
                        A página que você está buscando não foi encontrada.
                    </Text>
                </VStack>
            </Box>
        </>
    )
};

export default PageNotFound;