import { 
    Box, 
    Text, 
    useBreakpointValue, 
    Image, 
    VStack, 
    FormControl, 
    FormLabel, 
    Input, 
    Button,
    Link as ChakraLink,
    FormErrorMessage,
    useToast
} from "@chakra-ui/react";
import loginPageBannerImage from "../assets/img/login-page-banner.jpg";
import darkLogoNutrivegImage from "../assets/img/dark-logo-nutriveg.png";
import { Link as ReactRouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAxios from "../hooks/useAxios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";

const schemaValidation = yup.object({
    email:
        yup.string()
        .trim()
        .required("O e-mail é obrigatório")
        .email("Digite um e-mail válido")
        .max(150, "O e-mail deve ter no máximo 150 caracteres"),
    password:
        yup.string()
        .trim()
        .required("A senha é obrigatória")
        .min(6, "A senha deve ter no mínimo 6 caracteres")
        .max(10, "A senha deve ter no máximo 10 caracteres"),
});

function LoginPage() {

    const api = useAxios();

    const isMobile = useBreakpointValue({base: true, md: false});

    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }} = useForm({
        resolver: yupResolver(schemaValidation)
    });

    const { setAuthToken } = useAuthContext();

    async function onSubmit(userData) {
        setIsLoading(true);

        try {
            userData.email = userData.email.toLowerCase();
            const { email, password } = userData;
            const response = await api.post("/users/login", {
                email,
                senha: password
            });

            //obtém o token jwt da resposta enviada pelo back-end
            const token = response.data.token;

            //chama a função setAuthToken do AuthProvider e passa o token como parametro
            setAuthToken(token);

            toast({
                title: "Login bem-sucedido!",
                description: "Você está agora conectado.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch(error) {
            console.error("Erro ao realizar o login:", error.response?.data || error);
            if(error.response && error.response.status === 400) {
                toast({
                    title: "E-mail ou senha inválidos.",
                    description: "Verifique suas informações e tente novamente.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Erro no Servidor.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            };      
        } finally {
            setIsLoading(false);
        };
    };

    return(
        <>
            <Box
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >

                <Box
                    marginLeft={{base: "34px", lg: "72px"}}  
                    marginRight={{base: "34px", lg: "72px"}}
                    marginTop="185px"
                    marginBottom="85px"
                    height={{base:"670px", md:"630px", lg:"670px"}} 
                    display={{md:"flex"}} 
                    borderRadius="20px"
                    border="1px"
                    borderColor="#DEE2E6"
                >
                    <Box 
                        borderRadius="18px"
                        width={{base:"100%", md:"50%"}} 
                        height="100%"
                        display="flex"
                        justifyContent="center"
                    >
                        <VStack marginTop={{base:"63px", md:"53px", lg:"63px"}} >
                            <Image 
                                src={darkLogoNutrivegImage}
                                width="140px"
                                height="60px"
                            />
                            <Text
                                marginTop={{base:"24px", md:"14px", lg:"24px"}} 
                                fontSize={{base:"28px", md:"32px"}} 
                                fontWeight="bold"
                                color="#212529"
                            >
                                Entrar
                            </Text>
                            <Text
                                marginTop="12px"
                                fontWeight="light"
                                color="#6C757D"
                                align="center"
                            >
                                Bem vindo(a) de volta! Digite seus dados.
                            </Text>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <FormControl isInvalid={errors.email}>
                                    <FormLabel 
                                        fontWeight="light"
                                        marginTop="32px"
                                    >
                                        E-mail
                                    </FormLabel>
                                    <Input 
                                        type="text"
                                        {...register("email")}
                                        width={{base:"280px", md:"320px", lg:"360px"}}
                                        height="38px"
                                        borderRadius="4px"
                                        border="1px"
                                        borderColor="#CED4DA"
                                    />
                                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.password}>
                                    <FormLabel 
                                        fontWeight="light"
                                        marginTop="16px"
                                    >
                                        Senha
                                    </FormLabel>
                                    <Input 
                                        type="password"
                                        {...register("password")}
                                        width={{base:"280px", md:"320px", lg:"360px"}}
                                        height="38px"
                                        borderRadius="4px"
                                        border="1px"
                                        borderColor="#CED4DA"
                                    />
                                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                                </FormControl>

                                <Button
                                    marginTop="30px"
                                    width={{base:"280px", md:"320px", lg:"360px"}}
                                    height="38px"
                                    borderRadius="4px"
                                    background="#219653"
                                    fontWeight="light"
                                    color="#FFFFFF"
                                    type="submit"
                                    isLoading={isLoading}
                                >
                                    Entrar
                                </Button>
                            </form>
                            <Text
                                marginTop="20px"
                                fontWeight="light"
                                color="#6C757D"
                            >
                                Não tem uma conta?{" "}
                                <ChakraLink 
                                    as={ReactRouterLink} 
                                    to="/criar-conta" 
                                    color="#219653" 
                                    textDecoration="underline"
                                >
                                    Criar conta
                                </ChakraLink>
                            </Text>
                        </VStack>
                    </Box>
                    {!isMobile ? (
                        <Box 
                            width="50%"
                            borderRadius="18px"
                            backgroundImage={loginPageBannerImage}
                            backgroundPosition="center"
                            backgroundSize="cover"
                            backgroundRepeat="no-repeat"
                        /> 
                    ) : (
                        <>
                        </>
                    )}
                </Box>

            </Box>
        </>
    );
};

export default LoginPage;