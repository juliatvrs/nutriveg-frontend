import { 
    Card, 
    CardHeader, 
    CardBody,
    Image, 
    Avatar,
    Box, 
    Badge,
    Text,
    HStack,
    Button,
    Flex
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

function NutritionistProfileCard({ nutritionist }) {

    const navigate = useNavigate();

    const isValidCoverPicture = nutritionist?.coverPicture && !nutritionist.coverPicture.includes("null");

    return(
        <>
            <Link to={`/perfil/${nutritionist.id}`}>
                <Card
                    width="100%"
                    height="400px"
                    borderRadius="10px"
                    border="1px"
                    borderColor="#D9D9D9"
                >
                    <CardHeader
                        paddingLeft="7px"
                        paddingRight="7px"
                        paddingTop="7px" 
                    >
                        <Box position="relative">
                            {isValidCoverPicture ? (
                                <Image
                                    src={nutritionist.coverPicture}
                                    borderRadius="10px"
                                    height="140px"
                                    width="100%"
                                    objectFit="cover" //para a imagem se ajustar sem ficar distorcida
                                />
                            ) : (
                                <Box 
                                    width="100%"
                                    height="140px"
                                    borderRadius="10px"
                                    background="#D3D3D3"
                                />
                            )}
                            
                            <Box position="absolute"  left="50%" transform="translate(-50%, -50%)">
                                <Avatar
                                    src={nutritionist.profilePicture}
                                    name={nutritionist.name}
                                    size="xl"
                                />
                            </Box>
                        </Box>
                    </CardHeader>
                    <CardBody>

                        <Text
                            align="center"
                            paddingTop="10px"
                            fontWeight="bold"
                            fontSize={{base:"22px", md:"24px"}}
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1, 
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }} 
                        >
                            {nutritionist.name}
                        </Text>

                        {nutritionist.focus === "vegana" ? (
                                <Text align="center" fontSize="15px" fontWeight="light">
                                    Nutrição Vegana
                                </Text>
                            ) : nutritionist.focus === "vegetariana" ? (
                                <Text align="center" fontSize="15px" fontWeight="light">
                                    Nutrição Vegetariana
                                </Text>
                            ) : nutritionist.focus === "vegana_e_vegetariana" && (
                                <Text align="center" fontSize="15px" fontWeight="light">
                                    Nutrição Vegana e Vegetariana
                                </Text>
                        )}

                        <HStack
                            paddingLeft="21px"
                            paddingRight="21px"
                            paddingTop="35px"
                            spacing="13px"
                            justifyContent="center"
                        >
                            {nutritionist.numberOfPublishedRecipes === 1 ? (
                                <Badge
                                    background="#D9D9D9"
                                    color="#219653"
                                    borderColor="#219653"
                                    border="1px"
                                    borderRadius="5px"
                                    fontSize={{base:"9px", md:"12px"}} 
                                    fontWeight="medium"
                                    width={{base:"150px", md:"180px"}} 
                                    height="24px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {nutritionist.numberOfPublishedRecipes} Receita Publicada
                                </Badge>
                            ) : (
                                <Badge
                                    background="#D9D9D9"
                                    color="#219653"
                                    borderColor="#219653"
                                    border="1px"
                                    borderRadius="5px"
                                    fontSize={{base:"9px", md:"12px"}} 
                                    fontWeight="medium"
                                    width={{base:"150px", md:"180px"}} 
                                    height="24px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {nutritionist.numberOfPublishedRecipes} Receitas Publicadas
                                </Badge>
                            )}

                            {nutritionist.numberOfArticlesWritten === 1 ? (
                                <Badge
                                    background="#D9D9D9"
                                    color="#219653"
                                    borderColor="#219653"
                                    border="1px"
                                    borderRadius="5px"
                                    fontSize={{base:"9px", md:"12px"}} 
                                    fontWeight="medium"
                                    width={{base:"150px", md:"180px"}} 
                                    height="24px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {nutritionist.numberOfArticlesWritten} Artigo Escrito
                                </Badge>
                            ) : (
                                <Badge
                                    background="#D9D9D9"
                                    color="#219653"
                                    borderColor="#219653"
                                    border="1px"
                                    borderRadius="5px"
                                    fontSize={{base:"9px", md:"12px"}} 
                                    fontWeight="medium"
                                    width={{base:"150px", md:"180px"}} 
                                    height="24px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {nutritionist.numberOfArticlesWritten} Artigos Escritos
                                </Badge>
                            )}

                        </HStack>
                        <Flex justifyContent={"center"}>
                            <Button
                                marginTop="14px"
                                marginBottom="20px"
                                background="#219653"
                                width="373px"
                                height="40px"
                                borderRadius="25px"
                                color="#FFFFFF"
                                fontWeight="medium"
                                fontSize={{base:"15px", md:"16px"}}
                                onClick={(event) => {
                                    event.preventDefault(); 
                                    navigate(`/perfil/${nutritionist.id}`)
                                }}
                            >
                                Conhecer Nutricionista
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>
            </Link>
        </>
    );
};

export default NutritionistProfileCard;