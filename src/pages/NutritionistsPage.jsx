import { Box, SimpleGrid, Text, useToast, Center, Spinner } from "@chakra-ui/react";
import nutritionistsPageBannerImage from "../assets/img/nutritionists-page-banner.jpg";
import SearchBar from "../components/SearchBar/SearchBar";
import NutritionistProfileCard from "../components/NutritionistProfileCard/NutritionistProfileCard";
import Pagination from "../components/Pagination/Pagination";
import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";

function NutritionistsPage() {

    const api = useAxios();

    const [nutritionists, setNutritionists] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const [totalNutritionists, setTotalNutritionists] = useState(null);

    const toast = useToast();

    const [offset, setOffset] = useState(0);

    const limit = 9;

    const [isNutritionistFetchActive, setIsNutritionistFetchActive] = useState(false);

    const [isNutritionistSearchActive, setIsNutritionistSearchActive] = useState(false);

    const [isNutritionistFocusSortActive, setIsNutritionistFocusSortActive] = useState(false);

    async function fetchNutritionists(offset, limit) {
        setIsNutritionistFetchActive(true);
        setIsNutritionistSearchActive(false);
        setIsNutritionistFocusSortActive(false);

        try {
            const response = await api.get("nutritionists/list", { params: { offset, limit }});
            setNutritionists(response.data.nutritionists);
            setTotalNutritionists(response.data.totalNutritionists);
        } catch(error) {
            console.error("Erro ao receber nutricionistas: ", error.response?.data || error);
            if(!toast.isActive("unique-toast")) {
                toast({
                    id: "unique-toast",
                    title: "Não foi possível carregar os perfis dos nutricionistas.",
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
        fetchNutritionists(0, limit);
    }, []);


    const [currentSearchValue, setCurrentSearchValue] = useState(null);

    async function searchNutritionists(searchValue, offset, limit) {
        setIsNutritionistSearchActive(true);
        setIsNutritionistFetchActive(false);
        setIsNutritionistFocusSortActive(false);
        setCurrentSearchValue(searchValue);
        setIsSearchLoading(true);
        setIsLoading(true);

        try {
            const response = await api.get(`nutritionists/search/${encodeURIComponent(searchValue)}`, { params: { offset, limit } });
            setNutritionists(response.data.nutritionists);
            setTotalNutritionists(response.data.totalSearchedNutritionists);
        } catch(error) {
            console.error("Erro ao realizar busca: ", error.response?.data || error);
            if(error.response?.status === 404 && error.response?.data?.message === "Não existem nutricionistas com esse termo.") {
                toast({
                    title: "Nenhum nutricionista encontrado com o termo pesquisado.",
                    description: "Tente usar outra palavra-chave para encontrar nutricionistas.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true
                });
                setNutritionists(null);
                setTotalNutritionists(0);
            } else {
                toast({
                    title: "Erro ao pesquisar nutricionistas.",
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

    const nutritionistFocusSortOptions = [
        { value: "vegan", label: "Nutrição Vegana" },
        { value: "vegetarian", label: "Nutrição Vegetariana" },
        { value: "veganAndVegetarian", label: "Nutrição Vegana e Vegetariana" },
    ];

    const [sortValue, setSortValue] = useState("");

    const [sortErrorMessage, setSortErrorMessage] = useState("");

    async function handleNutritionistFocusSortChange(newSortValue, offset, limit) {
        if(newSortValue === "") {
            setSortValue(newSortValue);
            setSortErrorMessage("Selecione uma opção válida para ordenar");
            return;
        };

        setIsNutritionistFocusSortActive(true);
        setIsNutritionistFetchActive(false);
        setIsNutritionistSearchActive(false);
        setSortValue(newSortValue);
        setSortErrorMessage("");
        setIsLoading(true);

        try {
            const response = await api.get("nutritionists/sort", { params: { order: newSortValue, offset, limit } });
            setNutritionists(response.data.nutritionists);
            setTotalNutritionists(response.data.totalSortedNutritionists);
        } catch(error) {
            console.error("Erro ao ordenar nutricionistas: ", error.response?.data || error);
            toast({
                title: "Erro ao ordenar nutricionistas.",
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
    }, [isNutritionistFetchActive, isNutritionistSearchActive, isNutritionistFocusSortActive, sortValue, currentSearchValue]);

    function handlePaginationChange(page) {
        const paginationOffset = (page - 1) * limit;
        setOffset(paginationOffset);

        if(isNutritionistFetchActive) {
            fetchNutritionists(paginationOffset, limit);
        } else if(isNutritionistSearchActive) {
            searchNutritionists(currentSearchValue, paginationOffset, limit);
        } else {
            handleNutritionistFocusSortChange(sortValue, paginationOffset, limit);
        };
    };

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
                backgroundImage={nutritionistsPageBannerImage}
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
                        Nutricionistas
                    </Text>
                </Box>
            </Box>

            <Box
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >

                <SearchBar 
                    title="Pesquisar Profissionais" 
                    onSearch={searchNutritionists}
                    isSearchLoading={isSearchLoading}
                    options={nutritionistFocusSortOptions}
                    onChange={handleNutritionistFocusSortChange}
                    value={sortValue}
                    errorMessage={sortErrorMessage}
                    limit={9}
                    placeholder="Ordenar por foco"
                    isSearchActive={isNutritionistSearchActive}
                />

                <Box
                    marginLeft={{base:"34px", md:"72px"}}
                    marginRight={{base:"34px", md:"72px"}}
                    marginTop="85px"
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
                    ) : nutritionists && (
                        <>
                            <SimpleGrid
                                minChildWidth={{base:"305px", md:"415px"}} 
                                spacing="24px"
                            >
                                {nutritionists.map((nutritionist) => (
                                    <NutritionistProfileCard nutritionist={nutritionist} key={nutritionist.id} />
                                ))}
                            </SimpleGrid>

                            {totalNutritionists && totalNutritionists > 0 ? (
                                <Pagination 
                                    limit={limit}
                                    totalItems={totalNutritionists}
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

export default NutritionistsPage;