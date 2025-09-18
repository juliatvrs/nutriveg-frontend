import { 
    Box, 
    Text, 
    Flex, 
    Stack, 
    Button, 
    Menu, 
    MenuButton, 
    MenuList, 
    MenuItemOption, 
    MenuOptionGroup, 
    SimpleGrid, 
    Center, 
    Spinner,
    useToast,
    FormControl,
    FormErrorMessage,
    VStack
} from "@chakra-ui/react";
import recipesPageBannerImage from "../assets/img/recipes-page-banner.jpg";
import SearchBar from "../components/SearchBar/SearchBar";
import { ChevronDownIcon } from "@chakra-ui/icons";
import RecipeCard from "../components/RecipeCard/RecipeCard";
import Pagination from "../components/Pagination/Pagination";
import NutritionistsBanner from "../components/NutritionistsBanner/NutritionistsBanner";
import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";
import { useLocation, useNavigate } from "react-router-dom";

function RecipesPage() {

    const api = useAxios();

    const [recipes, setRecipes] = useState(null); 

    const [isLoading, setIsLoading] = useState(true);

    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const toast = useToast();

    const [isRecipeFetchActive, setIsRecipeFetchActive] = useState(false);

    const [isRecipeSearchActive, setIsRecipeSearchActive] = useState(false);

    const [isRecipeFilterActive, setIsRecipeFilterActive] = useState(false);

    const [isRecipeSortActive, setIsRecipeSortActive] = useState(false);

    async function fetchRecipes(offset, limit) {
        setIsRecipeFetchActive(true);
        setIsRecipeSearchActive(false);
        setIsRecipeFilterActive(false);
        setIsRecipeSortActive(false);

        try{
            const response = await api.get("recipes/list", { params: { offset, limit } });
            const mappedRecipes = response.data.recipes.map(recipe => ({
                id: recipe.id_receitas,
                image: recipe.imagem,
                title: recipe.nome_da_receita,
                summary: recipe.introducao
            }));
            setRecipes(mappedRecipes);
            setTotalRecipes(response.data.totalRecipes);
        } catch(error) {
            console.error("Erro ao receber receitas: ", error.response?.data || error);
            if(!toast.isActive("unique-toast")) {
                toast({
                    id: "unique-toast",
                    title: "Não foi possível carregar as receitas.",
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
        fetchRecipes(0, limit);
    }, []);

    
    const [currentSearchValue, setCurrentSearchValue] = useState(null);

    //função para enviar o termo de pesquisa do usuário inserido na barra de busca com o objetivo de pesquisar receitas.
    async function searchRecipes(searchValue, offset, limit) {
        setIsRecipeSearchActive(true);
        setIsRecipeFetchActive(false);
        setIsRecipeFilterActive(false)
        setIsRecipeSortActive(false);
        setCurrentSearchValue(searchValue);
        setIsSearchLoading(true);
        setIsLoading(true);

        try {
            //encodeURIComponent codifica o termo de pesquisa do usuário para garantir que caracteres especiais, 
            //como espaços, acentos, e símbolos, sejam corretamente tratados na URL, evitando problemas como quebra ou erros na requisição.
            const response = await api.get(`recipes/search/${encodeURIComponent(searchValue)}`, { params: { offset, limit } });
            const mappedRecipes = response.data.recipes.map(recipe => ({
                id: recipe.id_receitas,
                image: recipe.imagem,
                title: recipe.nome_da_receita,
                summary: recipe.introducao
            }));
            setRecipes(mappedRecipes);
            setTotalRecipes(response.data.totalSearchedRecipes);
        } catch(error) {
            console.error("Erro ao realizar busca!", error.response?.data || error);
            if(error.response?.status === 404) {
                toast({
                    title: "Nenhuma receita encontrada com o termo pesquisado.",
                    description: "Tente usar outra palavra-chave para encontrar receitas.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true
                });
                setRecipes(null);
                setTotalRecipes(0);
            } else {
                toast({
                    title: "Erro ao pesquisar receitas.",
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


    //variável de estado que armazena as opções selecionadas pelo usuário no filtro de categorias
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState([]);

    //variável de estado que armazena as opções selecionadas pelo usuário no filtro de alimentação
    const [selectedTypeOfDietFilter, setSelectedTypeOfDietFilter] = useState([]);

    //variável de estado que armazena as opções selecionadas pelo usuário no filtro de publicado por
    const [selectedPublishedByFilter, setSelectedPublishedByFilter] = useState([]);

    const [filterErrorMessage, setFilterErrorMessage] = useState("");

    const [isFilterLoading, setIsFilterLoading] = useState(false);

    async function filterRecipes(offset, limit) {
        if(selectedCategoryFilter.length === 0 && selectedTypeOfDietFilter.length === 0 && selectedPublishedByFilter.length === 0) {
            setFilterErrorMessage("Sem filtros selecionados! Por favor, escolha ao menos uma opção para ver resultados.");
            return;
        };

        setIsRecipeFilterActive(true);
        setIsRecipeFetchActive(false);
        setIsRecipeSearchActive(false);
        setIsRecipeSortActive(false);
        setIsFilterLoading(true);
        setIsLoading(true);

        try{
            const filters = {
                categoria: selectedCategoryFilter || undefined,
                alimentacao: selectedTypeOfDietFilter || undefined,
                publicadoPor: selectedPublishedByFilter || undefined
            };
            const response = await api.get(`recipes/filter`, { params: { filters: JSON.stringify(filters), offset, limit } });
            const mappedRecipes = response.data.recipes.map(recipe => ({
                id: recipe.id_receitas,
                image: recipe.imagem,
                title: recipe.nome_da_receita,
                summary: recipe.introducao
            }));
            setRecipes(mappedRecipes);
            setTotalRecipes(response.data.totalFilteredRecipes);
        } catch(error) {
            console.error("Erro ao realizar busca por filtros: ", error.response?.data || error);
            if(error.response?.status === 404) {
                toast({
                    title: "Nenhuma receita encontrada para o filtro aplicado.",
                    description: "Tente ajustar os filtros e pesquise novamente.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true
                });
                setRecipes(null);
                setTotalRecipes(0);
            } else {
                toast({
                    title: "Erro ao filtrar receitas.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
            };
        } finally {
            setIsFilterLoading(false);
            setIsLoading(false);
        };
    };


    //vetor de objetos que contém as opções de ordenação das receitas que irão aparecer no Select.
    //cada objeto possui:
    //- "value": o valor enviado na requisição ao back-end para determinar o critério de ordenação.
    //- "label": o texto exibido para o usuário no componente Select.
    const recipeSortOptions = [
        { value: "recent", label: "Mais Recentes" },
        { value: "oldest", label: "Mais Antigas" },
        { value: "bestRated", label: "Melhor Avaliadas" }
    ];

    //variável de estado que armazena o valor atual da ordenação de receitas escolhido pelo usuário.
    const [sortValue, setSortValue] = useState("");

    //variável de estado que armazena uma mensagem de erro caso o usuário selecione o placeholder "Ordenar por" como uma opção de ordenação.
    const [sortErrorMessage, setSortErrorMessage] = useState("");

    //função que é acionada sempre que acontece alguma mudança no Select de ordenação das receitas.
    async function handleRecipeSortChange(newSortValue, offset, limit) {
        if(newSortValue === "") {
            setSortValue(newSortValue);
            setSortErrorMessage("Selecione uma opção válida para ordenar");
            return;
        };

        setIsRecipeSortActive(true);
        setIsRecipeFetchActive(false);
        setIsRecipeSearchActive(false);
        setIsRecipeFilterActive(false);
        setSortValue(newSortValue);
        setSortErrorMessage("");
        setIsLoading(true);

        try {
            const response = await api.get("recipes/sort", { params: { order: newSortValue, offset, limit } });
            const mappedRecipes = response.data.recipes.map(recipe => ({
                id: recipe.id_receitas,
                image: recipe.imagem,
                title: recipe.nome_da_receita,
                summary: recipe.introducao
            }));
            setRecipes(mappedRecipes);
            setTotalRecipes(response.data.totalSortedRecipes);
        } catch(error) {
            console.error("Erro ao ordenar receitas: ", error.response?.data || error);
            toast({
                title: "Erro ao ordenar receitas.",
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
    }, [isRecipeFetchActive, isRecipeSearchActive, isRecipeFilterActive, isRecipeSortActive, sortValue, currentSearchValue]);

    //variável de estado que armazena o valor atual do offset, calculado com base na página ativa.
    //o offset é usado para determinar a partir de qual posição no conjunto de receitas a requisição deve começar.
    const [offset, setOffset] = useState(0);

    //número máximo de receitas exibidas por página.
    const limit = 12;

    //variável de estado que armazena a quantidade total de receitas disponíveis na aplicação.
    //esse valor é usado para calcular a quantidade de páginas e ajustar os botões da paginação.
    const [totalRecipes, setTotalRecipes] = useState(null);

    //função para gerenciar a paginação.
    //calcula o offset e faz a requisição ao back-end para carregar as receitas da página correspondente.
    function handlePaginationChange(page) {
        const paginationOffset = (page - 1) * limit;
        setOffset(paginationOffset);
       
        if(isRecipeFetchActive) {
            fetchRecipes(paginationOffset, limit);
        } else if(isRecipeSearchActive) {
            searchRecipes(currentSearchValue, paginationOffset, limit);
        } else if(isRecipeFilterActive) {
            filterRecipes(paginationOffset, limit);
        } else {
            handleRecipeSortChange(sortValue, paginationOffset, limit);
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
        if(order === "melhorAvaliadas") {
            handleRecipeSortChange("bestRated", 0, 12);
            navigate("/receitas", { replace: true });
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
                backgroundImage={recipesPageBannerImage}
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
                        fontSize={{base: "28px", md: "43px", lg: "49px"}} 
                        fontWeight="bold"
                        color="#FFFFFF"
                        width={{md:"449px"}} 
                        align="center"
                        marginLeft={{base:"10px"}} 
                        marginRight={{base:"10px"}}
                    >
                        Receitas Veganas e Vegetarianas
                    </Text>
                </Box>
            </Box>

            <Box 
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >

                <SearchBar 
                    title="Pesquisar Receitas" 
                    onSearch={searchRecipes} 
                    isSearchLoading={isSearchLoading}
                    options={recipeSortOptions}
                    onChange={handleRecipeSortChange}
                    value={sortValue}
                    errorMessage={sortErrorMessage}
                    limit={limit}
                    placeholder="Ordenar por"
                    isSearchActive={isRecipeSearchActive}
                />
                
                <Flex 
                    alignItems="center" 
                    justifyContent="center" 
                    marginTop="85px"
                >
                    <FormControl isInvalid={filterErrorMessage}>
                        <VStack>
                            <Stack
                                direction={{base:"column", md:"row"}} 
                                spacing={{base:"10px", lg:"20px"}}
                            >
                                <Menu closeOnSelect={false}>
                                    <MenuButton 
                                        as={Button}
                                        rightIcon={<ChevronDownIcon />}
                                        width={{base:"235px", md:"200px", lg:"255px"}} 
                                        height="55px"
                                        borderRadius="50px"
                                        border="1px"
                                        borderColor="#BDBDBD"
                                        fontSize={{base:"18px", md:"20px", lg:"24px"}}
                                        fontWeight="bold"
                                    >
                                        Categorias
                                    </MenuButton>
                                    <MenuList width={{base:"235px", md:"220px", lg:"255px"}}>
                                        <MenuOptionGroup 
                                            type="checkbox"
                                            onChange={(values) => {
                                                setSelectedCategoryFilter(values);
                                                setFilterErrorMessage("");
                                            }}
                                        >
                                            <MenuItemOption value="cafe">
                                                Café da Manhã 
                                            </MenuItemOption>
                                            <MenuItemOption value="lanchesESobremesas">
                                                Lanches e Sobremesas
                                            </MenuItemOption>
                                            <MenuItemOption value="almocoEJantar">
                                                Almoço e Jantar
                                            </MenuItemOption>
                                        </MenuOptionGroup>
                                    </MenuList>
                                </Menu>

                                <Menu closeOnSelect={false}>
                                    <MenuButton 
                                        as={Button}
                                        rightIcon={<ChevronDownIcon />}
                                        width={{base:"235px", md:"200px", lg:"255px"}}
                                        height="55px"
                                        borderRadius="50px"
                                        border="1px"
                                        borderColor="#BDBDBD"
                                        fontSize={{base:"18px", md:"20px", lg:"24px"}}
                                        fontWeight="bold"
                                    >
                                        Alimentação
                                    </MenuButton>
                                    <MenuList width={{base:"235px", md:"220px", lg:"255px"}}>
                                        <MenuOptionGroup 
                                            type="checkbox"
                                            onChange={(values) => {
                                                setSelectedTypeOfDietFilter(values);
                                                setFilterErrorMessage("");
                                            }}
                                        >
                                            <MenuItemOption value="vegano">
                                                Vegana
                                            </MenuItemOption>
                                            <MenuItemOption value="vegetariano">
                                                Vegetariana
                                            </MenuItemOption>
                                        </MenuOptionGroup>
                                    </MenuList>
                                </Menu>

                                <Menu closeOnSelect={false}>
                                    <MenuButton 
                                        as={Button}
                                        rightIcon={<ChevronDownIcon />}
                                        width={{base:"235px", md:"200px", lg:"255px"}}
                                        height="55px"
                                        borderRadius="50px"
                                        border="1px"
                                        borderColor="#BDBDBD"
                                        fontSize={{base:"18px", md:"20px", lg:"24px"}}  
                                        fontWeight="bold"
                                    >
                                        Publicado por
                                    </MenuButton>
                                    <MenuList width={{base:"235px", md:"220px", lg:"255px"}}>
                                        <MenuOptionGroup 
                                            type="checkbox"
                                            onChange={(values) => {
                                                setSelectedPublishedByFilter(values);
                                                setFilterErrorMessage("");
                                            }}
                                        >
                                            <MenuItemOption value="membros">
                                                Membros
                                            </MenuItemOption>
                                            <MenuItemOption value="nutricionistas">
                                                Nutricionistas
                                            </MenuItemOption>
                                        </MenuOptionGroup>
                                    </MenuList>
                                </Menu>

                                <Button
                                    width={{base:"235px", md:"115px", lg: "161px"}} 
                                    height="55px"
                                    borderRadius="25px"
                                    background="#219653"
                                    color="#FFFFFF"
                                    fontWeight="semibold"
                                    onClick={() => {
                                        filterRecipes(0, limit); 
                                        setOffset(0);
                                    }}
                                    isLoading={isFilterLoading}
                                >
                                    Filtrar
                                </Button>
                            </Stack>
                            {filterErrorMessage && (
                                <FormErrorMessage 
                                    marginRight={{base:"15px", md:"0"}}
                                    marginLeft={{base:"15px", md:"0"}}
                                    textAlign="center"
                                >
                                    {filterErrorMessage}
                                </FormErrorMessage>
                            )}
                        </VStack>
                    </FormControl>
                </Flex>

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
                ) : recipes && (
                    <>
                        <SimpleGrid
                            marginTop="85px"
                            marginLeft={{base:"34px", md:"72px"}}
                            marginRight={{base:"34px", md:"72px"}}
                            spacing="24px"
                            minChildWidth="285px"
                        >
                            {recipes.map((recipe) => (
                                <RecipeCard recipe={recipe} key={recipe.id}/>
                            ))}
                        </SimpleGrid>
                        
                        {totalRecipes && totalRecipes > 0 ? (
                            <Pagination 
                                limit={limit} 
                                totalItems={totalRecipes} 
                                offset={offset} 
                                handlePaginationChange={handlePaginationChange}
                            />
                        ) : null}
                    </>
                )}

                <NutritionistsBanner />

            </Box>
        </>
    );
};

export default RecipesPage;