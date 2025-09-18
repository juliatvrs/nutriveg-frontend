import { 
    Box, 
    Text, 
    Stack, 
    Button, 
    VStack, 
    Link as ChakraLink, 
    SimpleGrid, 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalBody,
    ModalCloseButton,
    useDisclosure, 
    useToast,
    Center,
    Spinner,
    HStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Link as ReactRouterLink, useNavigate, useParams } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader/ProfileHeader";
import RecipeCard from "../components/RecipeCard/RecipeCard";
import ArticleCard from "../components/ArticleCard/ArticleCard";
import Pagination from "../components/Pagination/Pagination";
import useAuthContext from "../hooks/useAuthContext";
import useAxios from "../hooks/useAxios";

function ProfilePage() {

    //propriedades para controlar a visibilidade do modal de informações de contato do nutricionista
    const { isOpen, onOpen, onClose } = useDisclosure();

    //variável de estado que armazena se o botão de "Receitas Publicadas" foi clicado.
    //se o botão foi clicado o seu valor será "true" e o grid de receitas publicadas será exibido.
    //se o botão não foi clicado o seu valor será "false" e o grid de artigos escritos será exibido.
    const [isPublishedRecipesActive, setIsPublishedRecipesActive] = useState(true);

    //variável de estado que armazena se o usuário comum ou nutricionista está visualizando o seu próprio perfil.
    //com base no valor dessa variável, o layout da tela de exibição de perfil irá mudar.
    //se for "true" significa que o usuário comum ou nutricionista está visualizando o seu próprio perfil e irão aparecer cards para publicar receitas e artigos.
    //se for "false" significa que o usuário comum ou nutricionista não está visualizando o seu próprio perfil e portanto os cards para publicar receitas e artigos não irão aparecer.
    const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(true);

    const { user } = useAuthContext();

    const [isLoading, setIsLoading] = useState(true);

    const [isUserRecipesLoading, setIsUserRecipesLoading] = useState(true);

    const [isNutritionistArticlesLoading, setIsNutritionistArticlesLoading] = useState(true);

    const { id } = useParams();

    const api = useAxios();
    
    const toast = useToast();

    const [userData, setUserData] = useState(null);

    const [userRecipes, setUserRecipes] = useState(null);

    const [nutritionistArticles, setNutritionistArticles] = useState(null);

    const [totalUserRecipes, setTotalUserRecipes] = useState(null);

    const [totalNutritionistArticles, setTotalNutritionistArticles] = useState(null);

    const [offset, setOffset] = useState(0);

    const recipeLimit = 8;

    let articleLimit = 6;

    const [userDataError, setUserDataError] = useState(false);

    const [userRecipesError, setUserRecipesError] = useState(false);

    const [nutritionistArticlesError, setNutritionistArticlesError] = useState(false);

    const navigate = useNavigate();

    async function fetchUserData() {
        try{
            const response = await api.get(`users/details/${id}`);
            setUserData(response.data.userData);
        } catch(error) {
            console.error("Erro ao receber dados do usuário: ", error.response?.data || error);
            setUserDataError(true);
        } finally {
            setIsLoading(false);
        };
    };

    async function fetchUserRecipes(offset, limit) {
        try {
            const response = await api.get(`users/${id}/recipes/published`, { params: { offset, limit } });
            setUserRecipes(response.data.userRecipes);
            setTotalUserRecipes(response.data.totalUserRecipes);
        } catch(error) {
            console.error("Erro ao receber receitas do usuário: ", error.response?.data || error);
            setUserRecipesError(true);
            setUserRecipes(null);
            setTotalUserRecipes(0);
        } finally {
            setIsUserRecipesLoading(false);
        };
    };

    async function fetchNutritionistArticles(offset, limit) {
        try {
            const response = await api.get(`users/${id}/articles/published`, { params: { offset, limit } });
            setNutritionistArticles(response.data.userArticles);
            setTotalNutritionistArticles(response.data.totalUserArticles);
        } catch(error) {
            console.error("Erro ao receber artigos do usuário: ", error.response?.data || error);
            setNutritionistArticlesError(true);
            setNutritionistArticles(null);
            setTotalNutritionistArticles(0);
        } finally {
            setIsNutritionistArticlesLoading(false);
        };
    };

    useEffect(() => {
        fetchUserData();
        fetchUserRecipes(0, recipeLimit);
        fetchNutritionistArticles(0, articleLimit);
    }, [id]);

    //exibe um toast de erro com mensagens específicas dependendo das falhas nas requisições de dados do usuário, receitas e artigos.
    useEffect(() => {
        const isNutritionist = userData?.type === "nutricionista";

        const errorMessage = {
            title: "Não foi possível carregar o perfil.",
            description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
            status: "error",
            duration: 6000,
            isClosable: true,
        };

        function getErrorTitle() {
            if(userDataError) {
                if(userRecipesError && (isNutritionist ? nutritionistArticlesError : true)) {
                    return "Não foi possível carregar o perfil.";
                }; 

                if(userRecipesError) {
                    return "Não foi possível carregar o perfil.";
                }; 

                if(isNutritionist ? nutritionistArticlesError : true) {
                    return "Não foi possível carregar o perfil.";
                }; 

                return "Não foi possível carregar o perfil.";
            };


            if(userRecipesError) {
                if(isNutritionist && nutritionistArticlesError){
                    return "Não foi possível carregar as receitas e artigos do perfil.";           
                };

                return "Não foi possível carregar as receitas do perfil.";
            };

            
            if(isNutritionist && nutritionistArticlesError) {
                return "Não foi possível carregar os artigos do perfil.";
            };

            return null;
        };

        const title = getErrorTitle();

        if(title) {
            toast({ ...errorMessage, title });

            if(userDataError) {
                navigate("/");
            };
        };
        
    }, [userDataError, userRecipesError, nutritionistArticlesError, navigate]);

    
    function handlePaginationChange(page) {
        if(isPublishedRecipesActive) {
            const paginationOffset = (page - 1) * recipeLimit;
            setOffset(paginationOffset);
            fetchUserRecipes(paginationOffset, recipeLimit);
        } else {
            const paginationOffset = (page - 1) * articleLimit;
            setOffset(paginationOffset);
            fetchNutritionistArticles(paginationOffset, articleLimit);
        };
    };

    useEffect(() => {
        setOffset(0);
        fetchUserRecipes(0, recipeLimit);
        fetchNutritionistArticles(0, articleLimit);
    }, [isPublishedRecipesActive])

    return (
        <>
            <Box
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >

                {isLoading ? (
                    <Center height="100vh">
                        <Spinner 
                            height="50px"
                            width="50px"
                            speed='0.65s'
                            thickness='4px'
                            color="#48BB78"
                            emptyColor="#EDF2F7"
                        />
                    </Center>
                ) : userData && (
                    <>
                        <Box
                            marginTop={{base:"100px", md:"188px"}} 
                            marginLeft={{base: "0", md:"34px", lg: "72px"}}  
                            marginRight={{base: "0", md:"34px", lg: "72px"}}
                        >
                            <ProfileHeader isEditingProfile={false} userData={userData} />
                        </Box>

                        <Box
                            marginTop="88px"
                            marginBottom="156px"
                            marginLeft={{base:"34px", lg:"72px"}}
                            marginRight={{base:"34px", lg:"72px"}}
                        >
                            {userData?.type === "nutricionista" ? (
                                <>
                                    <Box
                                        width="100%"
                                        borderRadius="20px"
                                        background="#D9D9D9"
                                        paddingTop="55px"
                                        paddingBottom="53px"
                                        paddingLeft={{base:"26px", md:"66px", lg:"76px"}}
                                        paddingRight={{base:"26px", md:"66px", lg:"76px"}}
                                    >
                                        <Text fontSize={{base:"20px", md:"24px", lg:"26px"}} fontWeight="bold">
                                            Sobre
                                        </Text>

                                        {userData?.about ? (
                                            <Text fontWeight="light" marginTop="16px">
                                                {userData?.about}
                                            </Text>
                                        ) : userData?.id === user?.id ? (
                                            <Text fontWeight="light" marginTop="16px">
                                                Você ainda não adicionou sua biografia.
                                            </Text>
                                        ) : (
                                            <Text fontWeight="light" marginTop="16px">
                                                Este nutricionista ainda não adicionou uma biografia.
                                            </Text>
                                        )}
                                
                                        <Stack marginTop="42px" direction={{base:"column", md:"row"}}>
                                            {userData?.city && userData?.state ? (
                                                <Text fontWeight="light" color="#718096">
                                                    {userData?.city}, {userData?.state}
                                                </Text>
                                            ) : userData?.id === user?.id ? (
                                                <Text fontWeight="light" color="#718096">
                                                    Você ainda não adicionou sua cidade e estado.
                                                </Text>
                                            ) : (
                                                <Text fontWeight="light" color="#718096">
                                                    Este nutricionista ainda não adicionou sua cidade e estado.
                                                </Text>
                                            )}

                                            <Stack direction="row">
                                                <Box 
                                                    background="#38A169"
                                                    height="6px"
                                                    width="6px"
                                                    borderRadius="50%"
                                                    alignSelf="center"
                                                />

                                                <Button
                                                    variant="unstyled" 
                                                    height="auto"
                                                    fontWeight="bold"
                                                    color="#38A169"
                                                    onClick={onOpen}
                                                >
                                                    Informações de Contato
                                                </Button>
                                            </Stack>
                                        </Stack>

                                        <Modal isOpen={isOpen} onClose={onClose} isCentered>
                                            <ModalOverlay />                           
                                            <ModalContent
                                                maxWidth={{base:"350px", md:"650px", lg:"800px"}} 
                                                borderRadius="20px"
                                            >                               
                                                <ModalHeader
                                                    padding="0"
                                                    marginTop="15px"
                                                    marginBottom="15px"
                                                    marginLeft={{base:"26px", md:"58px"}} 
                                                    marginRight={{base:"26px", md:"58px"}}
                                                    paddingRight="18px"
                                                >
                                                    <Text
                                                        fontSize={{base:"24px", md:"30px"}} 
                                                        fontWeight="bold"
                                                    >
                                                        {userData?.name}
                                                    </Text>
                                                </ModalHeader>
                                                <ModalCloseButton color="#000000" size="lg"/>
                                                <Box 
                                                    width="100%"
                                                    border="1px"
                                                    color="#828282"
                                                />
                                                <ModalBody 
                                                    padding="0"
                                                    marginTop="20px"
                                                    marginLeft={{base:"26px", md:"58px"}}
                                                    marginRight={{base:"26px", md:"58px"}}
                                                    marginBottom="58px"
                                                >
                                                    <Text
                                                        fontSize={{base:"20px", md:"22px"}} 
                                                        fontWeight="light"
                                                        color="#000000"
                                                    >
                                                        Informações de Contato
                                                    </Text>
                                                    {!userData?.linkedin && !userData?.instagram && !userData?.website && !userData?.email && !userData.phone ? (
                                                        <>
                                                            {userData?.id === user?.id ? (
                                                                <Text marginTop={"30px"}>
                                                                    Você ainda não adicionou suas informações de contato.
                                                                </Text>
                                                            ) : (
                                                                <Text marginTop={"30px"}>
                                                                    Este nutricionista ainda não adicionou informações de contato.
                                                                </Text>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {userData?.linkedin && (
                                                                <VStack
                                                                    marginTop="30px"
                                                                    alignItems="flex-start"
                                                                    gap="5px"
                                                                >
                                                                    <Text
                                                                        fontSize={{base:"18px", md:"20px"}} 
                                                                        fontWeight="bold"
                                                                    >
                                                                        LinkedIn
                                                                    </Text>
                                                                    <ChakraLink 
                                                                        href={userData?.linkedin}
                                                                        color="#3182CE"
                                                                        isExternal
                                                                    >
                                                                        {userData?.linkedin}
                                                                    </ChakraLink>
                                                                </VStack>
                                                            )} 
                                                            
                                                            {userData?.instagram && (
                                                                <VStack
                                                                    marginTop="32px"
                                                                    alignItems="flex-start"
                                                                    gap="5px"
                                                                >
                                                                    <Text
                                                                        fontSize={{base:"18px", md:"20px"}}
                                                                        fontWeight="bold"
                                                                    >
                                                                        Instagram
                                                                    </Text>
                                                                    <ChakraLink 
                                                                        href={userData?.instagram}
                                                                        color="#3182CE"
                                                                        isExternal
                                                                    >
                                                                        {userData?.instagram}
                                                                    </ChakraLink>
                                                                </VStack>
                                                            )}
                                                            
                                                            {userData?.website && (
                                                                <VStack
                                                                    marginTop="32px"
                                                                    alignItems="flex-start"
                                                                    gap="5px"
                                                                >
                                                                    <Text
                                                                        fontSize={{base:"18px", md:"20px"}}
                                                                        fontWeight="bold"
                                                                    >
                                                                        Site
                                                                    </Text>
                                                                    <ChakraLink 
                                                                        href={userData?.website}
                                                                        color="#3182CE"
                                                                        isExternal
                                                                    >
                                                                        {userData?.website}
                                                                    </ChakraLink>
                                                                </VStack>
                                                            )}
                                                            
                                                            {userData?.email && (
                                                                <VStack
                                                                    marginTop="32px"
                                                                    alignItems="flex-start"
                                                                    gap="5px"
                                                                >
                                                                    <Text
                                                                        fontSize={{base:"18px", md:"20px"}}
                                                                        fontWeight="bold"
                                                                    >
                                                                        Email
                                                                    </Text>
                                                                    <ChakraLink 
                                                                        href={`mailto:${userData?.email}`}
                                                                        color="#3182CE"
                                                                        isExternal
                                                                    >
                                                                        {userData?.email}
                                                                    </ChakraLink>
                                                                </VStack>
                                                            )}

                                                            {userData?.phone && (
                                                                <VStack
                                                                    marginTop="32px"
                                                                    alignItems="flex-start"
                                                                    gap="5px"
                                                                >
                                                                    <Text
                                                                        fontSize={{base:"18px", md:"20px"}}
                                                                        fontWeight="bold"
                                                                    >
                                                                        Telefone
                                                                    </Text>
                                                                    <ChakraLink 
                                                                        href={`tel:${userData?.phone}`}
                                                                        color="#3182CE"
                                                                        isExternal
                                                                    >
                                                                        {userData?.phone}
                                                                    </ChakraLink>
                                                                </VStack>
                                                            )}
                                                        </>
                                                    )}
                                                </ModalBody>
                                            </ModalContent>
                                        </Modal>
                                    </Box>

                                    {userData?.id === user?.id && (
                                        <HStack
                                            marginTop="33px"
                                            justify="space-between"
                                            width="100%"
                                        >
                                            <ChakraLink
                                                as={ReactRouterLink}
                                                to="/criar-receita"
                                                width="49%"
                                                height="199px"
                                                _hover={{textDecoration: "none"}}
                                            >
                                                <Box
                                                    width="100%"
                                                    height="100%"
                                                    borderRadius="20px"
                                                    border="1px"
                                                    borderColor="#D9D9D9"
                                                    paddingRight="10px"
                                                    paddingLeft="10px"
                                                    boxShadow="3px 6px 16.4px 1px rgba(0, 0, 0, 0.10)"
                                                >
                                                    <VStack
                                                        height="100%"
                                                        align="center"
                                                        justify="center"
                                                        gap="10px"
                                                    >
                                                        <AddIcon 
                                                            width={{base:"14px", md:"18px", lg:"20px"}} 
                                                            height={{base:"14px", md:"18px", lg:"20px"}}
                                                            fontWeight="bold"
                                                        />
                                                        <Text 
                                                            fontSize={{base:"18px", md:"22px", lg:"24px"}} 
                                                            fontWeight="bold"
                                                            align="center"
                                                        >
                                                            Publicar nova receita
                                                        </Text>
                                                    </VStack>
                                                </Box>
                                            </ChakraLink>

                                            <ChakraLink
                                                as={ReactRouterLink}
                                                to="/criar-artigo"
                                                width="49%"
                                                height="199px"
                                                _hover={{textDecoration: "none"}}
                                            >
                                                <Box
                                                    width="100%"
                                                    height="100%"
                                                    borderRadius="20px"
                                                    border="1px"
                                                    borderColor="#D9D9D9"
                                                    paddingRight="10px"
                                                    paddingLeft="10px"
                                                    boxShadow="3px 6px 16.4px 1px rgba(0, 0, 0, 0.10)"
                                                >
                                                    <VStack
                                                        height="100%"
                                                        align="center"
                                                        justify="center"
                                                        gap="10px"
                                                    >
                                                        <AddIcon 
                                                            width={{base:"14px", md:"18px", lg:"20px"}} 
                                                            height={{base:"14px", md:"18px", lg:"20px"}}
                                                            fontWeight="bold"
                                                        />
                                                        <Text 
                                                            fontSize={{base:"18px", md:"22px", lg:"24px"}}
                                                            fontWeight="bold"
                                                            align="center"
                                                        >
                                                            Escrever novo artigo
                                                        </Text>
                                                    </VStack>
                                                </Box>
                                            </ChakraLink>
                                        </HStack>
                                    )}
                                    
                                    <Stack
                                        marginTop={userData?.id === user?.id ? "24px" : "61px"} 
                                        marginBottom="22px"
                                        direction={{base:"column", md:"row"}} 
                                        gap={{base:"15px", md:"50px"}} 
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Button
                                            width="fit-content"
                                            height="auto"
                                            variant="unstyled"
                                            fontSize={{base:"24px", md:"26px", lg:"32px"}} 
                                            fontWeight="normal"
                                            color={isPublishedRecipesActive ? "#1E1E1E" : "#828282"}
                                            onClick={() => setIsPublishedRecipesActive(true)}
                                        >
                                            Receitas Publicadas
                                        </Button>
                                        <Button
                                            width="fit-content"
                                            height="auto"
                                            variant="unstyled"
                                            fontSize={{base:"24px", md:"26px", lg:"32px"}}
                                            fontWeight="normal"
                                            color={isPublishedRecipesActive ? "#828282" : "#1E1E1E"}
                                            onClick={() => setIsPublishedRecipesActive(false)}
                                        >
                                            Artigos Escritos
                                        </Button>
                                    </Stack>
                                    <Box 
                                        maxWidth={{base:"350px", md:"650px", lg:"800px"}} 
                                        border="1px"
                                        borderColor="#828282"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        margin="0 auto"
                                    />
                            
                                    {isPublishedRecipesActive ? (
                                        <>
                                            {isUserRecipesLoading ? (
                                                <Center height="290px">
                                                    <Spinner 
                                                        height="50px"
                                                        width="50px"
                                                        speed='0.65s'
                                                        thickness='4px'
                                                        color="#48BB78"
                                                        emptyColor="#EDF2F7"
                                                    />
                                                </Center>
                                            ) : userRecipes && (
                                                <>
                                                    <SimpleGrid
                                                        marginTop="61px"
                                                        spacing="24px"
                                                        minChildWidth="285px"
                                                    >
                                                        {userRecipes?.map((userRecipe) => (
                                                            <RecipeCard recipe={userRecipe} key={userRecipe.id} />
                                                        ))}
                                                    </SimpleGrid>
                                                    {totalUserRecipes && totalUserRecipes > 0 ? (
                                                        <Pagination 
                                                            limit={recipeLimit}
                                                            totalItems={totalUserRecipes}
                                                            offset={offset}
                                                            handlePaginationChange={handlePaginationChange}
                                                        />  
                                                    ) : null}
                                                </>
                                            )}
                                        </>

                                    ) : (
                                        <>
                                            {isNutritionistArticlesLoading ? (
                                                <Center height="290px">
                                                    <Spinner 
                                                        height="50px"
                                                        width="50px"
                                                        speed='0.65s'
                                                        thickness='4px'
                                                        color="#48BB78"
                                                        emptyColor="#EDF2F7"
                                                    />
                                                </Center>
                                            ) : nutritionistArticles && (
                                                <>
                                                    <SimpleGrid
                                                        minChildWidth={{base:"305px", md:"416px"}}
                                                        spacing="24px"
                                                        marginTop="61px"  
                                                    >
                                                        {nutritionistArticles?.map((nutritionistArticle) => (
                                                            <ArticleCard article={nutritionistArticle} key={nutritionistArticle.id} />
                                                        ))}
                                                    </SimpleGrid>
                                                    {totalNutritionistArticles && totalNutritionistArticles > 0 ? (
                                                        <Pagination 
                                                            limit={articleLimit}
                                                            totalItems={totalNutritionistArticles}
                                                            offset={offset}
                                                            handlePaginationChange={handlePaginationChange}
                                                        />
                                                    ) : null}    
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {userData?.id === user?.id && (
                                        <ReactRouterLink to="/criar-receita">
                                            <Box
                                                marginBottom="51px"
                                                width="100%"
                                                height="199px"
                                                borderRadius="20px"
                                                border="1px"
                                                borderColor="#D9D9D9"
                                                paddingRight="10px"
                                                paddingLeft="10px"
                                                boxShadow="3px 6px 16.4px 1px rgba(0, 0, 0, 0.10)"
                                            >
                                                <VStack
                                                    height="100%"
                                                    align="center"
                                                    justify="center"
                                                    gap="10px"
                                                >
                                                    <AddIcon 
                                                        width={{base:"14px", md:"18px", lg:"20px"}} 
                                                        height={{base:"14px", md:"18px", lg:"20px"}}
                                                        fontWeight="bold"
                                                    />
                                                    <Text 
                                                        fontSize={{base:"18px", md:"22px", lg:"24px"}} 
                                                        fontWeight="bold"
                                                        align="center"
                                                    >
                                                        Publicar nova receita
                                                    </Text>
                                                </VStack>
                                            </Box>
                                        </ReactRouterLink>
                                    )}
                                    
                                          
                                    <Text
                                        marginBottom="22px"
                                        align="center"
                                        fontSize={{base:"24px", md:"26px", lg:"32px"}} 
                                        fontWeight="normal"
                                        cursor="pointer"
                                    >
                                        Receitas Publicadas
                                    </Text>
                                    <Box 
                                        maxWidth={{base:"350px", md:"650px", lg:"800px"}} 
                                        border="1px"
                                        borderColor="#828282"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        margin="0 auto"
                                    />

                                    {isUserRecipesLoading ? (
                                        <Center height="290px">
                                            <Spinner 
                                                height="50px"
                                                width="50px"
                                                speed='0.65s'
                                                thickness='4px'
                                                color="#48BB78"
                                                emptyColor="#EDF2F7"
                                            />
                                        </Center>
                                    ) : userRecipes && (
                                        <>
                                            <SimpleGrid
                                                marginTop="61px"
                                                spacing="24px"
                                                minChildWidth="285px"
                                            >
                                                {userRecipes?.map((userRecipe) => (
                                                    <RecipeCard recipe={userRecipe} key={userRecipe.id} />
                                                ))}
                                            </SimpleGrid>
                                            {totalUserRecipes && totalUserRecipes > 0 ? (
                                                <Pagination 
                                                    limit={recipeLimit}
                                                    totalItems={totalUserRecipes}
                                                    offset={offset}
                                                    handlePaginationChange={handlePaginationChange}
                                                />
                                            ) : null}  
                                        </>
                                    )}
                                </>
                            )}             
                        </Box>
                    </>
                )}
                
            </Box>
        </>
    );
};

export default ProfilePage;