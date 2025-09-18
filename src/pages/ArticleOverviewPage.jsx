import { 
    Box, 
    Text, 
    Flex, 
    HStack, 
    Avatar, 
    Stack, 
    SimpleGrid, 
    Icon,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    VStack,
    Button,
    useDisclosure,
    useToast,
    Center,
    Spinner,
    Image
} from "@chakra-ui/react";
import { ArrowForwardIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArticleCard from "../components/ArticleCard/ArticleCard";
import useAxios from "../hooks/useAxios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import useAuthContext from "../hooks/useAuthContext";
import DOMPurify from "dompurify";

function ArticleOverviewPage() {

    const { isAuthenticated, user } = useAuthContext();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const { id } = useParams();

    const api = useAxios();

    const [articleData, setArticleData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const toast = useToast();

    const navigate = useNavigate();

    const [formattedPublicationDate, setFormattedPublicationDate] = useState("");

    useEffect(() => {
        const timeout = setTimeout(async function () {
            try {
                const response = await api.get(`articles/details/${id}`);
                setArticleData(response.data.articleDetails);
            } catch(error) {
                console.error("Erro ao receber dados do artigo: ", error.response?.data || error);
                navigate("/artigos");
                if(!toast.isActive("unique-toast")) {
                    toast({
                        id: "unique-toast",
                        title: "Não foi possível carregar o artigo.",
                        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                    });
                }; 
            } finally {
                setIsLoading(false);
            };
        },500)

        return () => clearTimeout(timeout)
    }, [id, api, navigate, toast]);


    const [sanitizedArticleText, setSanitizedArticleText] = useState(null);

    useEffect(() => {
        if(articleData) {
            if(articleData.text) {
                //sanitiza o conteúdo de articleText para remover qualquer código HTML malicioso (ex: scripts) e garantir
                //que o conteúdo seja seguro para exibição.
                const sanitize = DOMPurify.sanitize(articleData.text);
                setSanitizedArticleText(sanitize);
            };

            if(articleData.publicationDate) {
                let formatted = format(new Date(articleData?.publicationDate), "dd MMM, yyyy", { locale: ptBR });
                setFormattedPublicationDate(formatted);
            };
        };
    }, [articleData]);

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    async function onDeleteArticle() {
        setIsDeleteLoading(true);

        try {
            const userId = user?.id;

            const response = await api.delete(`articles/delete/${id}/${userId}`);
            toast({
                title: "Artigo excluído!",
                description: "O artigo foi removido com sucesso.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate(`/artigos`);
            }, 2000);
        } catch(error) {
            console.error("Erro ao excluir artigo:", error.response?.data || error);
            if(error.response?.status === 403 && error.response?.data?.error === "Você não tem permissão para excluir este artigo.") {
                toast({
                    title: "Ação não permitida.",
                    description: "Você não tem permissão para excluir este artigo.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true
                });
            } else {
                toast({
                    title: "Erro ao excluir artigo.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 4000,
                    isClosable: true
                });
            };
        } finally {
            setIsDeleteLoading(false);
        };
    };


    const [mostViewedArticles, setMostViewedArticles] = useState(null);

    const [isLoadingMostViewedArticles, setIsLoadingMostViewedArticles] = useState(true);

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
        fetchMostViewedArticles();
    }, []);

    return(
        <>
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
                ) : articleData && (
                    <>
                        <Box
                            width="100%"
                            height={{base:"244px", md:"344px", lg:"444px"}}
                        >
                            <Image 
                                src = {articleData.image}
                                alt = {articleData.title}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                            />
                        </Box>

                        <Box
                            maxWidth="1440px"
                            width="100%"
                            margin="0 auto"
                        >

                            <Flex
                                alignItems="center"
                                justifyContent="center"
                                marginTop="68px" 
                                marginBottom="96px"
                                marginRight={{base:"34px", lg:"0"}}
                                marginLeft={{base:"34px", lg:"0"}}
                            >
                                <Box width="882px">
                                    <Text
                                        fontSize="12px"
                                        fontWeight="bold"
                                    >
                                        {formattedPublicationDate}
                                    </Text>

                                    <HStack spacing="20px">
                                        <Text
                                            marginTop="14px"
                                            fontSize={{base:"32px", md:"40px", lg:"48px"}} 
                                            fontWeight="bold"
                                            maxWidth="100%"
                                        >
                                            {articleData.title}
                                        </Text>

                                        {isAuthenticated && user?.id === articleData.nutritionistId && (
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
                                                    onClick={onOpen}  
                                                />

                                                <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
                                                                Tem certeza que deseja excluir esse artigo?
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
                                                                A exclusão deste artigo é irreversível e todos os dados serão perdidos. 
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
                                                                    onClick={onDeleteArticle}
                                                                    isLoading={isDeleteLoading}
                                                                >
                                                                    Sim, excluir artigo!
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
                                                                    onClick={onClose}
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

                                    <HStack
                                        marginTop="50px"
                                        marginBottom="50px"
                                        spacing="18px"
                                    >
                                        <Link to={`/perfil/${articleData.nutritionistId}`}>
                                            <Avatar 
                                                name={articleData.nutritionistName}
                                                src={articleData.nutritionistProfilePicture}
                                                width={{base:"61px", md:"71px"}} 
                                                height={{base:"61px", md:"71px"}} 
                                            />
                                        </Link>
                                        <Stack>
                                            <Text 
                                                fontWeight="bold"
                                                fontSize={{base:"14px", md:"20px"}} 
                                            >
                                                {articleData.nutritionistName}
                                            </Text>

                                            {articleData.nutritionistFocus === "vegana" ? (
                                                <Text 
                                                    fontWeight="bold"
                                                    fontSize={{base:"14px", md:"20px"}}
                                                >
                                                    Nutrição Vegana
                                                </Text>
                                            ) : articleData.nutritionistFocus === "vegetariana" ? (
                                                <Text 
                                                    fontWeight="bold"
                                                    fontSize={{base:"14px", md:"20px"}}
                                                >
                                                    Nutrição Vegetariana
                                                </Text>
                                            ) : articleData.nutritionistFocus === "vegana_e_vegetariana" && (
                                                <Text 
                                                    fontWeight="bold"
                                                    fontSize={{base:"14px", md:"20px"}}
                                                >
                                                    Nutrição Vegana e Vegetariana
                                                </Text>
                                            )}
                                        </Stack>
                                    </HStack>

                                    <Text
                                        fontSize={{base:"18px", md:"20px"}}
                                        fontWeight="light"
                                        dangerouslySetInnerHTML={{ __html: sanitizedArticleText }}
                                    />
    
                                </Box>
                            </Flex>

                            <Box
                                marginBottom="145px"
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
            )}
        </>
    );
};

export default ArticleOverviewPage;