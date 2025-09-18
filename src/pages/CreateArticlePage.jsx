import { 
    Box, 
    Button, 
    Flex, 
    HStack, 
    Input, 
    Text, 
    VStack, 
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    FormControl,
    FormErrorMessage,
    useToast
} from "@chakra-ui/react";
import ImageUpload from "../components/ImageUpload/ImageUpload";
import{ useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useForm, useController } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuthContext from "../hooks/useAuthContext";
import useAxios from "../hooks/useAxios";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const articleSchemaValidation = yup.object({
    articleImage:
        yup.mixed()
        .required("A imagem é obrigatória"),
    articleTitle:
        yup.string()
        .required("O título do artigo é obrigatório")
        .trim()
        .max(150, "O título do artigo deve ter no máximo 150 caracteres")
        .min(30, "O título do artigo deve ter no mínimo 30 caracteres"),
    articleText:
        yup.string()
        .required("O texto do artigo é obrigatório")
        .trim()
        .max(20000, "O texto do artigo deve ter no máximo 20000 caracteres")
        .min(500, "O texto do artigo deve ter no mínimo 500 caracteres")
}).required();

function CreateArticlePage() {

    const { register, handleSubmit, setValue, clearErrors, control, formState:{ errors } } = useForm({
        resolver: yupResolver(articleSchemaValidation)
    });

    const { field } = useController({
        name: "articleText",
        control
    });

    const modules = {
        toolbar: [ //elementos disponíveis na barra de ferramentas
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{'list': 'bullet'}, {'list': 'ordered'}],
            ['link']
        ],
    };

    const formats = [ //garantindo que apenas esses formatos sejam aceitos no editor de texto
        "header",
        "bold", "italic", "underline",
        "list", "bullet", "ordered",
        "link"
    ];
      
    const { isOpen, onOpen, onClose } = useDisclosure(); //propriedades para controlar a visibilidade do modal de confirmação de publicação do artigo

    const [articleData, setArticleData] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuthContext();

    const api = useAxios();

    const toast = useToast();

    const navigate = useNavigate();

    function validatePageData(data) {
        setArticleData(data);
        if(data) {
            onOpen();
        } else {
            onClose();
        };
    };

    async function onArticleSubmit() {
        setIsLoading(true);

        try{
            const { articleImage, articleTitle, articleText } = articleData;

            //sanitiza o conteúdo de articleText para remover qualquer código HTML malicioso (ex: scripts),
            //garantindo que o dado seja seguro.
            const sanitizedArticleText = DOMPurify.sanitize(articleText);

            const nutritionistId = user?.id;

            const formData = new FormData();

            formData.append("nutritionistId", nutritionistId);
            formData.append("articleImage", articleImage);
            formData.append("articleTitle" ,articleTitle);
            formData.append("articleText", sanitizedArticleText);

            const response = await api.post("articles/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            let articleId = response.data.articleId;

            toast({
                title: "Artigo publicado com sucesso!",
                description: "Seu artigo já está no ar.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate(`/artigos/${articleId}`);
            }, 2000);
        } catch(error) {
            console.error("Erro ao cadastrar artigo:", error.response?.data || error);
            toast({
                title: "Erro ao publicar artigo.",
                description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        };
    };

    return(
        <>
            <form onSubmit={handleSubmit(validatePageData)}>
                <Box
                    marginTop="100px" //para que o conteúdo do box não comece atrás da header
                    width="100%"
                >
                    <FormControl isInvalid={errors.articleImage}>
                        <ImageUpload 
                            withBorderRadius={false} 
                            registerImage={(file) => {
                                //define o arquivo selecionado pelo usuário como valor do campo "articleImage"
                                setValue("articleImage", file);
                                //limpa erros de validação do campo "articleImage", se houver
                                clearErrors("articleImage");
                            }}
                        />
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <FormErrorMessage>
                                {errors.articleImage?.message}
                            </FormErrorMessage>
                        </Box>
                    </FormControl>
                    
                </Box>
            
                <Box
                    maxWidth="1440px"
                    width="100%"
                    margin="0 auto"
                >
                
                    <Flex 
                        alignItems="center" 
                        justifyContent="center" 
                        marginTop="85px" 
                        marginBottom="85px"
                    >
                        <VStack 
                            width="882px" 
                            spacing="28px" 
                            marginLeft={{base:"34px", lg:"0"}}
                            marginRight={{base:"34px", lg:"0"}}
                        >
                            <FormControl isInvalid={errors.articleTitle}>
                                <Input 
                                    autoFocus //para focar o input assim que ele for renderizado
                                    variant="unstyled"
                                    placeholder="Insira aqui o título do artigo"
                                    height="50px"
                                    fontSize={{base:"20px", md:"36px"}} 
                                    fontWeight="bold"
                                    {...register("articleTitle")}
                                />
                                <FormErrorMessage>
                                    {errors.articleTitle?.message}
                                </FormErrorMessage>
                            </FormControl>
                            
                            <FormControl isInvalid={errors.articleText}>
                                <Box width="100%" height={"450px"}>
                                    <ReactQuill 
                                        {...field}
                                        onChange={(value) => field.onChange(value)}
                                        modules={modules} 
                                        formats={formats}
                                        style={{height: "400px"}} //essa altura é apenas da caixa de texto, não inclui a barra de ferramentas
                                    />
                                </Box>
                                <FormErrorMessage>
                                    {errors.articleText?.message}
                                </FormErrorMessage>
                            </FormControl>

                            <HStack 
                                spacing="25px" 
                                justify="flex-end" 
                                width="100%" 
                                marginTop={{base:"20px"}}
                            >
                                <Button
                                    width="94px"
                                    height="38px"
                                    borderRadius="30px"
                                    border="1px"
                                    borderColor="#6FCF97"
                                    background="#FFFFFF00"
                                    fontWeight="light"
                                    color="#6FCF97"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    width="148px"
                                    height="38px"
                                    borderRadius="30px"
                                    background="#219653"
                                    fontWeight="light"
                                    color="#FFFFFF"
                                >
                                    Publicar Artigo
                                </Button>

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
                                                Tem certeza que deseja publicar esse artigo?
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
                                                Depois de publicar, você não poderá editar este artigo. Para fazer alterações, será necessário
                                                excluí-lo e criar um novo.
                                            </Text>
                                            <VStack spacing="18px" marginTop="30px">
                                                <Button
                                                    onClick={onArticleSubmit}
                                                    isLoading={isLoading}
                                                    width="245px"
                                                    height="40px"
                                                    borderRadius="25px"
                                                    background="#219653"
                                                    fontWeight="medium"
                                                    color="#FFFFFF"
                                                >
                                                    Sim, publicar artigo!
                                                </Button>
                                                <Button
                                                    width="245px"
                                                    height="40px"
                                                    borderRadius="25px"
                                                    border="1px"
                                                    borderColor="#38A169"
                                                    background="#FFFFFF"
                                                    fontWeight="medium"
                                                    color="#38A169"
                                                    onClick={onClose}
                                                >
                                                    Não, quero revisar.
                                                </Button>
                                            </VStack>
                                        </ModalBody>
                                    </ModalContent>
                                </Modal>

                            </HStack>

                        </VStack>
                    </Flex>
                
                </Box>
            </form>
        </>
    );
};

export default CreateArticlePage;