import { Box, Button, Flex, Icon, SimpleGrid, Text, Center, Spinner, useToast, VStack, Stack } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import homePageBannerImage from "../assets/img/home-page-banner.jpg";
import NutritionistRecipesCarousel from "../components/NutritionistRecipesCarousel/NutritionistRecipesCarousel";
import BestRatedRecipeCard from "../components/BestRatedRecipeCard/BestRatedRecipeCard";
import ArticleCard from "../components/ArticleCard/ArticleCard";
import NutritionistsBanner from "../components/NutritionistsBanner/NutritionistsBanner";
import useAxios from "../hooks/useAxios";
import { useEffect, useState } from "react";

function HomePage() {

    const api = useAxios();

    const [isLoadingBestRatedRecipes, setIsLoadingBestRatedRecipes] = useState(true);

    const [isLoadingMostViewedArticles, setIsLoadingMostViewedArticles] = useState(true);

    const [isLoadingRecentNutritionistRecipes, setIsLoadingRecentNutritionistRecipes] = useState(true);

    const [bestRatedRecipes, setBestRatedRecipes] = useState(null);

    const [mostViewedArticles, setMostViewedArticles] = useState(null);

    const [recentNutritionistRecipes, setRecentNutritionistRecipes] = useState(null);

    const toast = useToast();

    const navigate = useNavigate();

    async function fetchRecentNutritionistRecipes() {
        try {
            const response = await api.get("recipes/recent-by-nutritionists", { params: { offset: 0, limit: 4 } });
            setRecentNutritionistRecipes(response.data.recentNutritionistsRecipes);
        } catch(error) {
            console.error("Erro ao receber as receitas mais recentes publicadas por nutricionistas: ", error.response?.data || error);
            if(!toast.isActive("recentNutritionistRecipes")) {
                toast({
                    id: "recentNutritionistRecipes",
                    title: "Erro ao carregar as receitas de nutricionistas.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
            };
        } finally {
            setIsLoadingRecentNutritionistRecipes(false);
        };
    };

    async function fetchBestRatedRecipes() {
        try {
            const response = await api.get("recipes/sort", { params: { order: "bestRated", offset: 0, limit: 6 } });
            const mappedBestRatedRecipes = response.data.recipes.map(bestRatedRecipe => ({
                id: bestRatedRecipe.id_receitas,
                image: bestRatedRecipe.imagem,
                typeOfDiet: bestRatedRecipe.alimentacao,
                title: bestRatedRecipe.nome_da_receita
            }));
            setBestRatedRecipes(mappedBestRatedRecipes);
        } catch(error) {
            console.error("Erro ao receber as receitas melhor avaliadas: ", error.response?.data || error);
            if(!toast.isActive("bestRatedRecipesToast")) {
                toast({
                    id: "bestRatedRecipesToast",
                    title: "Erro ao carregar as receitas melhor avaliadas.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
            };
        } finally {
            setIsLoadingBestRatedRecipes(false);
        };
    };

    async function fetchMostViewedArticles() {
        try {
            const response = await api.get("articles/sort", { params: { order: "mostViewed", offset: 0, limit: 3 } });
            setMostViewedArticles(response.data.articles);
        } catch(error) {
            console.error("Erro ao receber os artigos mais acessados: ", error.response?.data || error);
            if(!toast.isActive("mostViewedArticlesToast")) {
                toast({
                    id: "mostViewedArticlesToast",
                    title: "Erro ao carregar os artigos mais acessados.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
            };
        } finally {
            setIsLoadingMostViewedArticles(false);
        };
    };

    useEffect(() => {
        fetchRecentNutritionistRecipes();
        fetchBestRatedRecipes();
        fetchMostViewedArticles();
    }, []);
    
    return(
        <>
            <Box
                marginTop="100px" //para que o banner não comece atrás da header
                position="relative"
                display="flex"
                alignItems="center"
                width="100%"
                height={{ base: "460px", md: "560px", lg: "660px" }}
                backgroundImage={homePageBannerImage}
                backgroundPosition="center"
                backgroundSize="cover"
                backgroundRepeat="no-repeat"
            > 
                <Box 
                    maxWidth="1440px"
                    width="100%"
                    margin="0 auto"
                >
                    <Box 
                        zIndex="1"
                        marginLeft={{base: "34px", lg: "72px"}}
                        marginTop={{base: "210px", md: "0", lg: "0"}}
                    >
                        <Text
                            fontSize={{base: "22px", md: "32px", lg: "39px"}}
                            fontWeight="bold"
                            color="#193C40"
                            width={{base:"240px", md:"530px", lg:"587px"}} 
                        >
                            Receitas e informações alimentares 
                        </Text>
                        <Text
                            fontSize={{base: "14px", md: "19px", lg: "23px"}} 
                            fontWeight="light"
                            color="#193C40"
                            width={{base: "290px", md:"400px", lg:"490px"}} 
                        > 
                            para uma dieta vegana e vegetariana saudável e equilibrada você encontra aqui 
                        </Text>
                        <Button 
                            variant="outline"
                            color="#219653"
                            fontWeight="medium"
                            width="150px"
                            height="40px"
                            borderRadius="25px"
                            border="1px"
                            borderColor="#219653"
                            marginTop="20px"
                            onClick={() => navigate("/receitas")}
                        >
                            Saiba mais
                        </Button>
                    </Box>
                </Box>
            </Box>
            
            <Box
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >
                
                <Box
                    marginTop="85px"
                    marginLeft={{base: "34px", lg: "72px"}}  
                    marginRight={{base: "34px", lg: "72px"}}
                >
                    <Stack direction="column" >
                        <Text
                            fontSize={{base: "26px", md: "38px", lg: "40px"}}  
                            fontWeight="light"
                            textAlign="center"
                        > 
                            Receitas de Nutricionistas 
                        </Text>
                        {isLoadingRecentNutritionistRecipes ? (
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
                        ) : recentNutritionistRecipes && (
                            <NutritionistRecipesCarousel recipe={recentNutritionistRecipes} />
                        )}
                        
                    </Stack>
                </Box>

                <Box
                    marginTop="85px"
                    marginLeft={{base: "34px", lg: "72px"}}  
                    marginRight={{base: "34px", lg: "72px"}}
                >
                    <Flex justify="space-between">
                        <Text
                            fontSize={{base: "26px", md: "38px", lg: "40px"}}  
                            fontWeight="light"
                            marginBottom="34px"
                        >
                            Receitas melhor Avaliadas
                        </Text>
                        <Link to="/receitas?ordenarPor=melhorAvaliadas">
                            <Text
                                fontWeight="bold"
                                fontSize={{sm:"18px", md:"22px", lg:"24px"}}  
                                color="#219653"
                                marginTop={{base:"10px", sm:"8px", md:"14.5px"}} 
                            >
                                Ver Mais <Icon as={ArrowForwardIcon} color="#219653" />
                            </Text>
                        </Link>
                        
                    </Flex>
                    {isLoadingBestRatedRecipes ? (
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
                    ) : bestRatedRecipes && (
                        <SimpleGrid
                            minChildWidth="196px" //a quantidade de colunas será ajustada com base na largura mínima dos filhos
                            spacing="24px"
                        >
                            {bestRatedRecipes.map((bestRatedRecipe) => (
                                <BestRatedRecipeCard bestRatedRecipe={bestRatedRecipe} key={bestRatedRecipe.id} />
                            ))}
                        </SimpleGrid>
                    )}
                </Box>

                <NutritionistsBanner />
                
                <Box
                    marginBottom="90px"
                    marginLeft={{base: "34px", lg: "72px"}}  
                    marginRight={{base: "34px", lg: "72px"}}
                >
                    <Flex justify="space-between">
                        <Text
                            fontSize={{base: "26px", md: "38px", lg: "40px"}}  
                            fontWeight="light"
                            marginBottom="34px"
                        >
                            Artigos mais Acessados
                        </Text>
                        <Link to="/artigos?ordenarPor=maisAcessados">
                            <Text
                                fontWeight="bold"
                                fontSize={{sm:"18px", md:"22px", lg:"24px"}}  
                                color="#219653"
                                marginTop={{base:"10px", sm:"8px", md:"14.5px"}} 
                            >
                                Ver Mais <Icon as={ArrowForwardIcon} color="#219653" />
                            </Text>
                        </Link>
                    </Flex>

                    {isLoadingMostViewedArticles ? (
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
                    ) : mostViewedArticles && (
                        <SimpleGrid
                            minChildWidth={{base:"305px", md:"416px"}} 
                            spacing="24px"
                        >
                            {mostViewedArticles.map((mostViewedArticle) => (
                                <ArticleCard article={mostViewedArticle} key={mostViewedArticle.id} />
                            ))}
                        </SimpleGrid>
                    )}
                </Box>

            </Box>
        </>
    );
};

export default HomePage;