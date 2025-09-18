import { 
    Box, 
    HStack, 
    Stack, 
    Text, 
    Icon, 
    Image, 
    Flex, 
    Grid, 
    GridItem, 
    SimpleGrid, 
    Avatar, 
    VStack, 
    Center, 
    Spinner, 
    useToast,
    Button,
    useDisclosure,
    Modal,
    ModalHeader,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    IconButton
} from "@chakra-ui/react";
import { TimeIcon, ArrowForwardIcon, DeleteIcon } from "@chakra-ui/icons";
import { GiKnifeFork } from "react-icons/gi";
import vegetarianTag from "../assets/img/vegetarian-tag.svg";
import veganTag from "../assets/img/vegan-tag.svg";
import BestRatedRecipeCard from "../components/BestRatedRecipeCard/BestRatedRecipeCard";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxios from "../hooks/useAxios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import useAuthContext from "../hooks/useAuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function RecipeOverviewPage() {

    const { isAuthenticated, user } = useAuthContext();

    const { 
        isOpen : isRattingModalOpen, 
        onOpen : onRattingModalOpen, 
        onClose : onRattingModalClose 
    } = useDisclosure(); //propriedades para controlar a visibilidade do modal de avaliação da receita

    const {
        isOpen : isDeleteRecipeModalOpen,
        onOpen : onDeleteRecipeModalOpen,
        onClose : onDeleteRecipeModalClose
    } = useDisclosure();

    const { id } = useParams();

    const api = useAxios();

    const [recipeData, setRecipeData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const toast = useToast();

    const navigate = useNavigate();

    //variável de estado que armazena a soma das avaliações da receita
    const [sumOfRatings, setSumOfRatings] = useState(0);

    //variável de estado que armazena o total de avaliações da receita
    const [totalOfRatings, setTotalOfRatings] = useState(0);

    //variável de estado que armazena a média de avaliações da receita
    const [averageRating, setAverageRating] = useState(0);

    //variável de estado que armazena uma mensagem para a situação onde uma receita ainda não tenha nenhuma avaliação
    const [noRatingsMessage, setNoRatingsMessage] = useState(null);

    const [formattedPublicationDate, setFormattedPublicationDate] = useState("");

    const [formattedPreparationTime, setFormattedPreparationTime] = useState("");

    const [renderIngredients, setRenderIngredients] = useState(null);

    const [renderPreparationSteps, setRenderPreparationSteps] = useState(null);

    
    useEffect(() => {
        async function fetchRecipeData() {
            try {
                const response = await api.get(`recipes/details/${id}`);
                setRecipeData({
                    image: response.data.imagem,
                    publicationDate: response.data.data_criacao,
                    title: response.data.nome_da_receita,
                    preparationTime: response.data.tempo_de_preparo,
                    servings: response.data.rendimento,
                    typeOfDiet: response.data.alimentacao,
                    summary: response.data.introducao,
                    ingredients: response.data.ingredientes,
                    preparationSteps: response.data.modoDePreparo,
                    userId: response.data.id_usuario,
                    userName: response.data.nome_usuario,
                    userType: response.data.tipo_usuario,
                    userProfilePicture: response.data.foto_perfil,
                    numberOfPublishedRecipes: response.data.totalReceitasUsuario,
                    numberOfArticlesWritten: response.data.quantidadeDeArtigosEscritos
                });
                setSumOfRatings(response.data.avaliacoes.somaAvaliacoes);
                setTotalOfRatings(response.data.avaliacoes.totalAvaliacoes);

                if(totalOfRatings > 0) {
                    setAverageRating(sumOfRatings / totalOfRatings);
                } else {
                    setAverageRating(0);
                    setNoRatingsMessage("Esta receita ainda não foi avaliada. Seja o primeiro a dar uma nota!");
                };
            } catch(error) {
                console.error("Erro ao receber dados da receita: ", error.response?.data || error);
                navigate("/receitas");
                if(!toast.isActive("unique-toast")) {
                    toast({
                        id: "unique-toast",
                        title: "Não foi possível carregar a receita.",
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

        fetchRecipeData();
    }, [id, api, navigate, toast, sumOfRatings, totalOfRatings]);

    useEffect(() => {
        if(recipeData) {
            if(recipeData.publicationDate) {
                //data de publicação da receita formatada utilizando a biblioteca date-fns
                let formatted = format(new Date(recipeData?.publicationDate), "dd MMM, yyyy", { locale: ptBR });
                setFormattedPublicationDate(formatted);
            };

            if(recipeData && recipeData.preparationTime) {
                function formatPreparationTime(time) {
                    const hour = time.split(":").slice(0, 1);
                    //caso a hora seja maior que 0, tanto a hora quanto os minutos serão exibidos.
                    //caso a hora seja menor que 0, somente os minutos serão exibidos.
                    if(hour > 0) {
                        return time.split(":").slice(0, 2).join("h") + "min";
                    } else {
                        return time.split(":").slice(1, 2) + "min";
                    };
                };

                setFormattedPreparationTime(formatPreparationTime(recipeData.preparationTime));
            };

            if(recipeData && recipeData.ingredients) {
                const render = recipeData.ingredients.map((ingredient, index) => (
                    <Text fontSize={{base:"18px", md:"20px"}} fontWeight="light" key={index}>
                        {ingredient}
                    </Text>
                ));

                setRenderIngredients(render);
            };

            if(recipeData && recipeData.preparationSteps) {
                const render = recipeData.preparationSteps.map((step, index) => (
                    <Stack
                        paddingBottom="60px"
                        direction="row"
                        spacing={{base:"18px", md:"38px"}}
                        borderBottom="1px"
                        borderColor="#BDBDBD"
                        key={index}
                    >
                        <Stack>
                            <Box 
                                background="#6FCF97"
                                width={{base:"61px", md:"71px"}} 
                                height={{base:"61px", md:"71px"}}
                                borderRadius="50%"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text
                                    fontSize="24px"
                                    color="#FFFFFF"
                                    fontWeight="extrabold"
                                >
                                    {index + 1}      
                                </Text>
                            </Box>
                        </Stack>

                        <Stack>
                            <Text
                                fontSize={{base:"18px", md:"20px"}}
                                fontWeight="light"
                            >
                                {step}
                            </Text>
                        </Stack>
                    </Stack>
                ));

                setRenderPreparationSteps(render);
            };
        };

    }, [recipeData]);

    //vetor para exibir as estrelas correspondentes à nota atual da receita
    //esse vetor é apenas para visualização da média das avaliações
    const displayStars = [];

    //avaliação média da receita
    //const averageRating = 3.5;

    for(let i = 1; i <= 5; i++) {
        if(i <= Math.floor(averageRating)) { //Math.floor arredonda o número para baixo
            displayStars.push(<FaStar key={i} color="#F2C94C" size="24px" />);
        } else if(i - averageRating < 1) {
            displayStars.push(<FaStarHalfAlt key={i} color="#F2C94C" size="24px" />);
        } else {
            displayStars.push(<FaRegStar key={i} color="#F2C94C" size="24px" />);
        };
    };

    //variável de estado que armazena a nota selecionada pelo usuário ao avaliar a receita
    const [selectedRating, setSelectedRating] = useState(null);
    
    //variável de estado que controla o valor temporário ao passar o mouse sobre as estrelas durante o processo de avaliação da receita
    //usado para alterar a cor das estrelas com base na interação do usuário (hover)
    const [hoverRating, setHoverRating] = useState(null);

    const [ratingErrorMessage, setRatingErrorMessage] = useState(null);

    const [isRatingLoading, setIsRatingLoading] = useState(false);

    async function onSubmitRating() {
        if(selectedRating < 1) {
            setRatingErrorMessage("Por favor, selecione uma nota antes de enviar sua avaliação.");
            return;
        };

        setIsRatingLoading(true);

        try{
            const userId = user?.id;

            const response = await api.post("recipes/rate", {
                nota: selectedRating,
                idUsuario: userId,
                idReceita: id
            });

            if(response.data.message === "Rating adicionado com sucesso") {
                const newSumOfRatings = sumOfRatings + selectedRating;
                const newTotalOfRatings = totalOfRatings + 1;
                const newAverageRating = newSumOfRatings / newTotalOfRatings;

                setSumOfRatings(newSumOfRatings);
                setTotalOfRatings(newTotalOfRatings);
                setAverageRating(newAverageRating);

                toast({
                    title: "Avaliação enviada!",
                    description: "Obrigado por contribuir! Sua nota foi registrada com sucesso.",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
                onRattingModalClose();
                setSelectedRating(0);
            } else {
                toast({
                    title: "Você já avaliou esta receita!",
                    description: "Não é possível enviar outra avaliação para esta receita.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
                onRattingModalClose();
                setSelectedRating(0);
            };
        } catch(error) {
            console.error("Erro ao enviar avaliação da receita:", error.response?.data || error);

            toast({
                title: "Erro ao enviar avaliação.",
                description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setIsRatingLoading(false);
        };
    };

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    async function onDeleteRecipe() {
        setIsDeleteLoading(true);
        try {
            const userId = user?.id;

            const response = await api.delete(`recipes/delete/${id}/${userId}`);
            
            if(response.data.error === "Você não tem permissão para excluir esta receita") {
                toast({
                    title: "Ação não permitida.",
                    description: "Você não tem permissão para excluir esta receita.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true
                });
            } else {
                toast({
                    title: "Receita excluída!",
                    description: "A receita foi removida com sucesso.",
                    status: "success",
                    duration: 2000,
                    isClosable: true
                });
                setTimeout(() => {
                    navigate(`/receitas`);
                }, 2000);
            };
        } catch(error) {
            console.error("Erro ao excluir receita:", error.response?.data || error);
            toast({
                title: "Erro ao excluir receita.",
                description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                status: "error",
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsDeleteLoading(false);
        };
    };

    
    const [bestRatedRecipes, setBestRatedRecipes] = useState(null);

    const [isBestRatedRecipesLoading, setIsBestRatedRecipesLoading] = useState(true);

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
            setIsBestRatedRecipesLoading(false);
        };
    };

    useEffect(() => {
        fetchBestRatedRecipes();
    }, []);

    return(
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
                ) : recipeData && (
                    <>
                        <Box
                            marginRight={{base:"0", md:"34px", lg:"72px"}}
                            marginLeft={{base:"0", md:"34px", lg:"72px"}}
                            marginTop={{base:"100px", md:"171px"}}
                        >
                            <Box 
                                width="100%"
                                height={{base:"313px", md:"413px", lg:"513px"}} 
                                borderRadius={{base:"0", md:"28px"}} 
                            >
                                <Image 
                                    src={recipeData.image}
                                    alt={recipeData.title}
                                    width="100%"
                                    height="100%"
                                    objectFit="cover"
                                    borderRadius={{base:"0", md:"25px"}}
                                />
                            </Box>

                        </Box>
                        <Box
                            marginLeft={{base: "34px", lg: "72px"}}
                            marginRight={{base: "34px", lg: "72px"}}
                            marginTop="68px"
                        >
                            <Text fontSize="12px" fontWeight="bold">
                                {formattedPublicationDate}
                            </Text>
                            <HStack spacing="20px">
                                <Text
                                    marginTop="14px"
                                    fontSize={{base:"32px", md:"40px", lg:"48px"}} 
                                    fontWeight="bold"
                                >
                                    {recipeData.title}
                                </Text>
                                {isAuthenticated && user?.id === recipeData.userId && (
                                    <>
                                        <IconButton 
                                            icon={
                                                <DeleteIcon 
                                                    width={{base:"18px", md:"20px", lg:"24px"}} 
                                                    height={{base:"18px", md:"20px", lg:"24px"}} 
                                                    color="#606060" 
                                                />
                                            }
                                            width={{base:"40px", md:"46px", lg:"54px"}} 
                                            height={{base:"40px", md:"46px", lg:"54px"}} 
                                            borderRadius="15px"
                                            border="1px"
                                            borderColor="#E0E0E0"
                                            backgroundColor="#F2F2F2"
                                            onClick={onDeleteRecipeModalOpen}
                                        />

                                        <Modal isOpen={isDeleteRecipeModalOpen} onClose={onDeleteRecipeModalClose} isCentered>
                                            <ModalOverlay />
                                            <ModalContent 
                                                maxWidth={{base:"350px", md:"700px", lg:"800px"}} 
                                                height="450px" 
                                                borderRadius="20px"
                                            >
                                                <ModalHeader 
                                                    marginTop={{base:"25px", md:"30px", lg:"20px"}} 
                                                    marginRight={{base:"10px", md:"147px", lg:"167px"}} 
                                                    marginLeft={{base:"10px", md:"147px", lg:"167px"}}
                                                >
                                                    <Text
                                                        fontSize={{base:"22px", md:"30px", lg:"36px"}} 
                                                        fontWeight="bold"
                                                        color="#000000"
                                                        align="center"
                                                    >
                                                        Tem certeza que deseja excluir essa receita?
                                                    </Text>
                                                </ModalHeader>
                                                <ModalBody 
                                                    marginTop="10px" 
                                                    marginRight={{base:"5px", md:"106px"}} 
                                                    marginLeft={{base:"5px", md:"106px"}}
                                                >
                                                    <Text
                                                        align="center"
                                                        fontSize={{base:"18px", md:"20px", lg:"22px"}}  
                                                        fontWeight="light"
                                                        color="#000000"
                                                    >
                                                        A exclusão desta receita é irreversível e todos os dados serão perdidos. 
                                                        Tem certeza de que deseja continuar?
                                                    </Text>
                                                    <VStack spacing="18px" marginTop="30px">
                                                        <Button
                                                            width="245px"
                                                            height="40px"
                                                            borderRadius="25px"
                                                            background="#A10000"
                                                            fontWeight="medium"
                                                            color="#FFFFFF"
                                                            onClick={onDeleteRecipe}
                                                            isLoading={isDeleteLoading}
                                                        >
                                                            Sim, excluir receita!
                                                        </Button>
                                                        <Button
                                                            width="245px"
                                                            height="40px"
                                                            borderRadius="25px"
                                                            border="1px"
                                                            borderColor="#A10000"
                                                            background="#FFFFFF"
                                                            fontWeight="medium"
                                                            color="#A10000"
                                                            onClick={onDeleteRecipeModalClose}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </VStack>
                                                </ModalBody>
                                            </ModalContent>
                                        </Modal>
                                    </>
                                )}
                            </HStack>
                            

                            <Box
                                marginTop="22px"
                                marginBottom="42px"
                                maxWidth={{base:"300px", md:"400px", lg:"892px"}} 
                                minHeight="111px"
                                background="#F2F2F2"
                                border="1px"
                                borderColor="#E0E0E0"
                                display="flex"
                                alignItems={{lg:"center"}} 
                            >
                                <Grid
                                    templateColumns={{base: "1fr", lg:"repeat(4, auto)"}}
                                    gap="20px"
                                    marginLeft={{base:"27px", lg:"47px"}} 
                                    marginRight={{base:"27px", lg:"47px"}} 
                                    marginTop={{base:"21px", lg:"0"}}
                                    marginBottom={{base:"21px", lg:"0"}}
                                >
                                    <GridItem>
                                        {totalOfRatings <= 0 ? (
                                            <Text
                                                textAlign={{base:"left", lg:"center"}} 
                                                width={{base:"fit-content", md:"270px"}} 
                                            >
                                                {noRatingsMessage}
                                            </Text>
                                        ) : (
                                            <HStack spacing={{base:"4px", md:"6px"}}>
                                                {displayStars}
                                                <Text fontSize={{md:"18px"}} fontWeight="light">
                                                    {averageRating.toFixed(1)}
                                                </Text>
                                            </HStack>
                                        )}
                                       
                                    </GridItem> 

                                    <GridItem>
                                        <HStack spacing="8px">
                                            <TimeIcon width={{base:"20px", md:"30px"}} height={{base:"20px", md:"30px"}} color="#219653"/>
                                            <Text fontSize={{md:"18px"}} fontWeight="light">
                                                {formattedPreparationTime}
                                            </Text>
                                        </HStack>
                                    </GridItem>

                                    <GridItem>
                                        <HStack spacing="5px">
                                            <Icon 
                                                as={GiKnifeFork} 
                                                width={{base:"20px", md:"30px"}} 
                                                height={{base:"20px", md:"30px"}} 
                                                color="#219653" 
                                            />
                                            {recipeData.servings === "1" ? (
                                                <Text fontSize={{md:"18px"}} fontWeight="light">
                                                    {recipeData.servings} Porção
                                                </Text>
                                            ) : (
                                                <Text fontSize={{md:"18px"}} fontWeight="light">
                                                    {recipeData.servings} Porções
                                                </Text>
                                            )}
                                        </HStack>
                                    </GridItem>

                                    <GridItem>
                                        <HStack spacing="9px">
                                            {recipeData.typeOfDiet === "vegano" ? (
                                                <>
                                                    <Image 
                                                        src={veganTag} 
                                                        width={{base:"20px", md:"30px"}} 
                                                        height={{base:"20px", md:"30px"}} 
                                                    />
                                                    <Text fontSize={{md:"18px"}} fontWeight="light">
                                                        Vegano
                                                    </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Image 
                                                        src={vegetarianTag} 
                                                        width={{base:"20px", md:"30px"}} 
                                                        height={{base:"20px", md:"30px"}} 
                                                    />
                                                    <Text fontSize={{md:"18px"}} fontWeight="light">
                                                        Vegetariano
                                                    </Text>
                                                </>
                                            )}
                                        </HStack>
                                    </GridItem>
                                </Grid>
                            </Box>

                            {isAuthenticated && (
                                <Box
                                    maxWidth={{base:"300px", md:"400px", lg:"892px"}}
                                    minHeight="111px"
                                    marginBottom={{base:"42px", md:"22px", lg:"12px"}} 
                                >
                                    <Stack
                                        direction={{base: "column", lg: "row"}}
                                        marginLeft={{base:"27px", lg:"47px"}} 
                                        marginRight={{base:"27px", lg:"47px"}} 
                                        marginTop={{base:"37px", lg:"17px"}}
                                        marginBottom={{base:"37px", lg:"17px"}}
                                    >
                                        <VStack align="flex-start">
                                            <Text
                                                fontSize={{base:"16px", md:"20px"}}
                                                fontWeight="bold"
                                            >
                                                Sua opinião é muito importante!
                                            </Text>
                                            <Text
                                                fontSize={{base:"16px", md:"20px"}}
                                                fontWeight="light"
                                            >
                                                O que achou dessa receita?
                                            </Text>
                                        </VStack>

                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            marginLeft={{base: "0", lg: "64px"}} 
                                            marginTop={{base: "5px", lg: "0"}}
                                        >
                                            <Button
                                                leftIcon={<FaRegStar  size="16px" />}
                                                borderRadius="25px"
                                                width={{base:"170px", md:"201px"}} 
                                                height="40px"
                                                backgroundColor="#219653"
                                                color="#FFFFFF"
                                                fontWeight="medium"
                                                fontSize={{base:"14px", md:"16px"}}
                                                onClick={onRattingModalOpen}
                                            >
                                                Avalie essa receita
                                            </Button>
                                        </Box>
                                    </Stack>

                                    <Modal isOpen={isRattingModalOpen} onClose={onRattingModalClose} isCentered>
                                        <ModalOverlay /> 
                                        <ModalContent
                                            maxWidth={{base:"350px", md:"650px", lg:"800px"}}
                                            height="450px"
                                            borderRadius="20px"
                                        >
                                            <ModalCloseButton color="#000000" size="lg"/>
                                            <ModalBody padding="0">
                                                <Box 
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    height="100%"
                                                >
                                                    <VStack>
                                                        <Text
                                                            fontSize={{base:"26px", md:"30px", lg:"33px"}} 
                                                            fontWeight="bold"
                                                            textAlign="center"
                                                            width={{base:"270px", md:"339px", lg:"359px"}} 
                                                        >
                                                            O que você achou dessa receita?
                                                        </Text>

                                                        <HStack 
                                                            marginTop="28px"
                                                            spacing={{base:"4px", md:"6px"}}
                                                        >
                                                            {[ ...Array(5)].map((star, index) => {
                                                                const ratingValue = index + 1;

                                                                return (
                                                                    <label key={index}>
                                                                        <input 
                                                                            hidden
                                                                            type="radio" 
                                                                            name="rating" 
                                                                            value={ratingValue}
                                                                            onClick={() => {
                                                                                setSelectedRating(ratingValue); 
                                                                                setRatingErrorMessage("");
                                                                            }}
                                                                        />
                                                                        <FaStar 
                                                                            size="34px" 
                                                                            cursor="pointer"
                                                                            color={ratingValue <= (hoverRating || selectedRating) ? "#F2C94C" : "#E4E5E9"}
                                                                            onMouseEnter={() => setHoverRating(ratingValue)}
                                                                            onMouseLeave={() => setHoverRating(null)}
                                                                        />
                                                                    </label>
                                                                )
                                                            })}  
                                                        </HStack>
                                                           
                                                        <Button
                                                            marginTop="45px"
                                                            width={{base:"180px", md:"210px", lg:"245px"}} 
                                                            height="40px"
                                                            borderRadius="25px"
                                                            backgroundColor="#219653"
                                                            color="#FFFFFF"
                                                            fontWeight="medium"
                                                            onClick={onSubmitRating}
                                                            isLoading={isRatingLoading}
                                                        >
                                                            Avaliar Receita!
                                                        </Button>

                                                        {ratingErrorMessage && (
                                                            <Text
                                                                marginTop="15px"
                                                                color="red"
                                                                textAlign="center"
                                                                marginRight={{base:"10px", md:"0"}}
                                                                marginLeft={{base:"10px", md:"0"}}
                                                            >
                                                                {ratingErrorMessage}
                                                            </Text>
                                                        )}
                                                        
                                                    </VStack>
                                                </Box>
                                            </ModalBody>
                                        </ModalContent>
                                    </Modal>
                                </Box>
                            )}
                            
                            <Link to={`/perfil/${recipeData.userId}`}>
                                <Box
                                    marginBottom="70px"
                                    maxWidth={{base:"300px", md:"400px", lg:"892px"}} 
                                    minHeight="111px"
                                    border="1px"
                                    borderColor="#6FCF97"
                                    borderRadius="18px"
                                    display="flex"
                                    alignItems="center"
                                >
                                    <Stack
                                        marginLeft={{base:"27px", lg:"47px"}} 
                                        marginRight={{base:"27px", lg:"47px"}} 
                                        marginTop={{base:"37px", lg:"0"}}
                                        marginBottom={{base:"37px", lg:"0"}}
                                        direction={{base:"column", lg:"row"}} 
                                    >
                                        <HStack spacing="18px">
                                            <Avatar 
                                                src={recipeData.userProfilePicture}
                                                name={recipeData.userName}
                                                width={{base:"61px", md:"71px"}} 
                                                height={{base:"61px", md:"71px"}} 
                                            />
                                            <Text fontSize={{base:"16px", md:"20px"}} fontWeight="bold">
                                                {recipeData.userName}
                                            </Text>
                                        </HStack>
                            
                                        <VStack 
                                            marginLeft={{base:"0", lg:"44px"}} 
                                            marginTop={{base:"10px", lg:"0"}} 
                                            align="flex-start" 
                                            justifyContent="center"
                                        >
                                            <Flex justify="space-between" align="center" width="100%">
                                                {recipeData.numberOfPublishedRecipes === 1 ? (
                                                    <Text fontSize={{base:"16px", md:"20px"}} fontWeight="light">
                                                        <Text as="span" color="#219653"> {recipeData.numberOfPublishedRecipes} </Text> Receita publicada
                                                    </Text>
                                                ) : (
                                                    <Text fontSize={{base:"16px", md:"20px"}} fontWeight="light">
                                                        <Text as="span" color="#219653"> {recipeData.numberOfPublishedRecipes} </Text> Receitas publicadas
                                                    </Text>
                                                )}
                                                <ArrowForwardIcon fontSize="20px" fontWeight="light" color="#219653" marginLeft="10px" />
                                            </Flex>
                                            {recipeData.userType === "nutricionista" && (
                                                <Flex justify="space-between" align="center" width="100%">
                                                    {recipeData.numberOfArticlesWritten === 1 ? (
                                                        <Text fontSize={{base:"16px", md:"20px"}} fontWeight="light">
                                                            <Text as="span" color="#219653"> {recipeData.numberOfArticlesWritten} </Text> Artigo escrito
                                                        </Text>
                                                    ) : (
                                                        <Text fontSize={{base:"16px", md:"20px"}} fontWeight="light">
                                                            <Text as="span" color="#219653"> {recipeData.numberOfArticlesWritten} </Text> Artigos escritos
                                                        </Text>
                                                    )}
                                                    
                                                    <ArrowForwardIcon fontSize="20px" fontWeight="light" color="#219653"/>
                                                </Flex>
                                            )}
                                        </VStack>
                                    </Stack>
                                </Box>
                            </Link>
          

                            <Text maxWidth="892px" fontWeight="light">
                                {recipeData.summary}
                            </Text>

                            <Box
                                marginTop="62px"
                                alignSelf="flex-start"
                                maxWidth="892px"
                            >
                                <Text fontSize={{base:"28px", md:"36px", lg:"40px"}} fontWeight="normal">
                                    Ingredientes
                                </Text>
                               
                                <Stack
                                    direction="column"
                                    marginTop="18px"
                                    spacing="21px"
                                >
                                   {renderIngredients}
                                </Stack>
                            </Box>

                            <Box
                                marginTop="74px"
                                alignSelf="flex-start"
                                maxWidth="892px"
                                
                            >
                                <Text fontSize={{base:"28px", md:"36px", lg:"40px"}} fontWeight="normal">
                                    Modo de Preparo
                                </Text>
                                <Stack spacing="51px" direction="column" marginTop="24px">
                                   {renderPreparationSteps}
                                </Stack>
                            </Box>
                        </Box>
                    </>
                )}

                <Box 
                    marginTop="91px"
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
                    {isBestRatedRecipesLoading ? (
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
            </Box>
        </>
    );
};

export default RecipeOverviewPage;