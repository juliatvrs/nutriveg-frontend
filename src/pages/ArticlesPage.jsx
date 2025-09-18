import { Box, SimpleGrid, Text, useToast, Center, Spinner } from "@chakra-ui/react";
import articlesPageBannerImage from "../assets/img/articles-page-banner.jpg";
import SearchBar from "../components/SearchBar/SearchBar";
import ArticleCard from "../components/ArticleCard/ArticleCard";
import Pagination from "../components/Pagination/Pagination";
import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";
import { useLocation, useNavigate } from "react-router-dom";

function ArticlesPage() {

    const api = useAxios();

    const [articles, setArticles] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const toast = useToast();

    //variável de estado que armazena o valor atual do offset, calculado com base na página ativa.
    //o offset é usado para determinar a partir de qual posição no conjunto de artigos a requisição deve começar.
    const [offset, setOffset] = useState(0);

    //número máximo de artigos exibidos por página.
    const limit = 6;

    //variável de estado que armazena a quantidade total de artigos disponíveis na aplicação.
    //esse valor é usado para calcular a quantidade de páginas e ajustar os botões da paginação.
    const [totalArticles, setTotalArticles] = useState(null);

    const [isArticleFetchActive, setIsArticleFetchActive] = useState(false);

    const [isArticleSearchActive, setIsArticleSearchActive] = useState(false);

    const [isArticleSortActive, setIsArticleSortActive] = useState(false);

    async function fetchArticles(offset, limit) {
        setIsArticleFetchActive(true);
        setIsArticleSearchActive(false);
        setIsArticleSortActive(false);

        try {
            const response = await api.get("articles/list", { params: { offset, limit } });
            setArticles(response.data.articles);
            setTotalArticles(response.data.totalArticles);
        } catch(error) {
            console.error("Erro ao receber artigos: ", error.response?.data || error);
            if(!toast.isActive("unique-toast")) {
                toast({
                    id: "unique-toast",
                    title: "Não foi possível carregar os artigos.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                });
            };
        } finally {
            setIsLoading(false);
        };
    };

    useEffect(() => {
        fetchArticles(0, limit);
    }, []);


    const [currentSearchValue, setCurrentSearchValue] = useState(null);

    async function searchArticles(searchValue, offset, limit) {
        setIsArticleSearchActive(true);
        setIsArticleFetchActive(false);
        setIsArticleSortActive(false);
        setCurrentSearchValue(searchValue);
        setIsSearchLoading(true);
        setIsLoading(true);

        try {
            const response = await api.get(`articles/search/${encodeURIComponent(searchValue)}`, { params: { offset, limit } });
            setArticles(response.data.articles);
            setTotalArticles(response.data.totalSearchedArticles);
        } catch(error) {
            console.error("Erro ao relizar busca: ", error.response?.data || error);
            if(error.response?.status === 404 && error.response?.data?.message === "Não existem artigos com esse termo.") {
                toast({
                    title: "Nenhum artigo encontrado com o termo pesquisado.",
                    description: "Tente usar outra palavra-chave para encontrar artigos.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true
                });
                setArticles(null);
                setTotalArticles(0);
            } else {
                toast({
                    title: "Erro ao pesquisar artigos.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
            };
        } finally {
            setIsSearchLoading(false);
            setIsLoading(false);
        };
    };

    const articleSortOptions = [
        { value: "recent", label: "Mais Recentes" },
        { value: "oldest", label: "Mais Antigos" },
        { value: "mostViewed", label: "Mais Acessados" }
    ];

    const [sortValue, setSortValue] = useState("");

    const [sortErrorMessage, setSortErrorMessage] = useState("");

    async function handleArticleSortChange(newSortValue, offset, limit) {
        if(newSortValue === "") {
            setSortValue(newSortValue);
            setSortErrorMessage("Selecione uma opção válida para ordenar");
            return;
        };

        setIsArticleSortActive(true);
        setIsArticleFetchActive(false);
        setIsArticleSearchActive(false);
        setSortValue(newSortValue);
        setSortErrorMessage("");
        setIsLoading(true);

        try {
            const response = await api.get("articles/sort", { params: { order: newSortValue, offset, limit } });
            setArticles(response.data.articles);
            setTotalArticles(response.data.totalSortedArticles);
        } catch(error) {
            console.error("Erro ao ordenar artigos: ", error.response?.data || error);
            toast({
                title: "Erro ao ordenar artigos.",
                description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                status: "error",
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsLoading(false);
        };
    };

    useEffect(() => {
        setOffset(0);
    }, [isArticleFetchActive, isArticleSearchActive, isArticleSortActive, sortValue, currentSearchValue]);

    function handlePaginationChange(page) {
        const paginationOffset = (page - 1) * limit;
        setOffset(paginationOffset);

        if(isArticleFetchActive) {
            fetchArticles(paginationOffset, limit);
        } else if(isArticleSearchActive) {
            searchArticles(currentSearchValue, paginationOffset, limit);
        } else {
            handleArticleSortChange(sortValue, paginationOffset, limit);
        };
    };

    //o hook useLocation é utilizado para acessar informações sobre a URL atual da aplicação.
    const location = useLocation();

    //acesssa os query params (parâmetros de consulta) disponíveis na URL da aplicação.
    const params = new URLSearchParams(location.search);

    //acessa o valor do parâmetro de consulta nomeado "ordenarPor" na URL.
    const order = params.get("ordenarPor");

    const navigate = useNavigate();

    useEffect(() => {
        if(order === "maisAcessados") {
            handleArticleSortChange("mostViewed", 0, 6);
            navigate("/artigos", { replace: true });
        };
    }, [order]);

    return(
        <>
            <Box
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
                marginTop="100px" //para que o banner não comece atrás da header
                width="100%"
                height={{base: "220px", md: "320px", lg: "420px"}}  
                backgroundImage={articlesPageBannerImage}
                backgroundPosition="center"
                backgroundSize="cover"
                backgroundRepeat="no-repeat"
                _after={{ //cria uma camada de sobreposição
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bg: "rgba(0, 0, 0, 0.6)",
                    zIndex: 1,
                  }}
            >
                <Box zIndex="2">
                    <Text
                        fontSize={{base: "30px", md: "55px", lg: "60px"}} 
                        fontWeight="bold"
                        color="#FFFFFF"
                    >
                        Artigos
                    </Text>
                </Box>
            </Box>

            <Box
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >

                <SearchBar 
                    title="Pesquisar Artigos" 
                    onSearch={searchArticles}
                    isSearchLoading={isSearchLoading}
                    options={articleSortOptions}
                    onChange={handleArticleSortChange}
                    value={sortValue}
                    errorMessage={sortErrorMessage}
                    limit={limit}
                    placeholder="Ordenar por"
                    isSearchActive={isArticleSearchActive}
                />

                <Box
                    marginLeft={{base:"34px", md:"72px"}}
                    marginRight={{base:"34px", md:"72px"}}
                    marginBottom="85px"
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
                    ) : articles && (
                        <>
                            <SimpleGrid
                                minChildWidth={{base:"305px", md:"416px"}}
                                spacing="24px"
                                marginTop="85px"  
                            >
                                {articles.map((article) => (
                                    <ArticleCard article={article} key={article.id} />
                                ))}
                            </SimpleGrid>
                            
                            {totalArticles && totalArticles > 0 ? (
                                <Pagination 
                                    limit={limit}
                                    totalItems={totalArticles}
                                    offset={offset}
                                    handlePaginationChange={handlePaginationChange}
                                />
                            ) : null}
                        </>
                    )}
                
                </Box>

            </Box>
        </>
    );
};

export default ArticlesPage;