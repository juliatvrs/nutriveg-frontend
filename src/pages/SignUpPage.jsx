import { 
    Box, 
    Flex, 
    Text, 
    Button, 
    VStack, 
    FormControl, 
    FormLabel, 
    Input, 
    FormHelperText, 
    Stack, 
    FormErrorMessage, 
    useToast,
    Radio,
    RadioGroup
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import useAxios from "../hooks/useAxios";

//esquema de validação dos campos do formulário de cadastro do usuário membro.
const memberSchemaValidation = yup
    .object({
        memberName: 
            yup.string()
            .trim()
            .required("O nome é obrigatório")
            .min(2, "O nome deve ter no mínimo 2 caracteres")
            .max(100, "O nome deve ter no máximo 100 caracteres"),
        memberEmail: 
            yup.string()
            .trim()
            .required("O e-mail é obrigatório")
            .email("Digite um e-mail válido")
            .max(150, "O e-mail deve ter no máximo 150 caracteres"),
        memberPassword: 
            yup.string()
            .trim()
            .required("A senha é obrigatória")
            .min(6, "A senha deve ter no mínimo 6 caracteres")
            .max(10, "A senha deve ter no máximo 10 caracteres"),
        memberConfirmPassword: 
            yup.string()
            .trim()
            .required("Confirmar a senha é obrigatório")
            .oneOf([yup.ref("memberPassword")], "As senhas devem ser iguais"),
    }).required();

    //esquema de validação dos campos do formulário de cadastro do usuário nutricionista.
    const nutritionistSchemaValidation = yup
        .object({
            nutritionistName:
                yup.string()
                .trim()
                .required("O nome é obrigatório")
                .min(2, "O nome deve ter no mínimo 2 caracteres")
                .max(100, "O nome deve ter no máximo 100 caracteres"),
            nutritionistEmail:
                yup.string()
                .trim()
                .required("O e-mail é obrigatório")
                .email("Digite um e-mail válido")
                .max(150, "O e-mail deve ter no máximo 150 caracteres"),
            crn: 
                yup.string()
                .trim()
                .required("O CRN é obrigatório")
                .max(10, "O CRN deve ter no máximo 10 caracteres"),
            education: 
                yup.string()
                .trim()
                .required("A formação é obrigatória")
                .min(8, "A formação deve ter no mínimo 8 caracteres")
                .max(70, "A formação deve ter no máximo 70 caracteres"),
            focus:
                yup.string()
                .oneOf(["vegan", "vegetarian", "veganAndVegetarian"], "Selecione uma opção válida")
                .required("Pelo menos uma opção deve ser selecionada"),
            nutritionistPassword:
                yup.string()
                .trim()
                .required("A senha é obrigatória")
                .min(6, "A senha deve ter no mínimo 6 caracteres")
                .max(10, "A senha deve ter no máximo 10 caracteres"),
            nutritionistConfirmPassword:
                yup.string()
                .trim()
                .required("Confirmar a senha é obrigatório")
                .oneOf([yup.ref("nutritionistPassword")], "As senhas devem ser iguais"),
    }).required();

function SignUpPage() {

    const api = useAxios();

    //variável de estado que armazena se o botão de membro foi clicado.
    //se o botão foi clicado o seu valor será "true" e o formulário de cadastro do membro será exibido.
    //se o botão não foi clicado o seu valor será "false" e o formulário de cadastro do nutricionista será exibido.
    const [isMemberActive, setIsMemberActive] = useState(true);

    const navigate = useNavigate();

    const toast = useToast();

    //variável de estado que indica se a requisição a API está em andamento.
    //se o seu valor for "true" significa que a requisição está sendo processada e irá aparecer um spinner no botão de "Criar Conta".
    const [isLoading, setIsLoading] = useState(false);

    //register, handleSubmit e formState são propriedades do hook useForm.
    //register serve para "registrar" os inputs, informando ao react-hook-form que aquele input deve ser monitorado.
    //o register atribui automaticamente o valor passado para ele ao atributo name do input. 
    //handleSubmit é uma função que lida com o envio do formulário. ela irá primeiramente executar a validação do formulário,
    //se todos os dados forem válidos ela irá então chamar a função que ela recebe como argumento.
    //formState fornece informações sobre o estado atual do formulário, como por exemplo: se possui erro, se está válido, etc.
    const { register: registerMember, handleSubmit: handleMemberSubmit, formState: { errors: errorsMember } } = useForm({
        resolver: yupResolver(memberSchemaValidation) //usando o esquema de validação do usuário membro feito com o yup
    }); 

    const { register: registerNutritionist, handleSubmit: handleNutritionistSubmit, formState: { errors: errorsNutritionist }, watch, trigger, setValue } = useForm({
        resolver: yupResolver(nutritionistSchemaValidation) //usando o esquema de validação do usuário nutricionista feito com o yup
    });

    const focus = watch("focus");

    const [isFocusInteracted, setIsFocusInteracted] = useState(false);

    useEffect(() => {
        if(focus) {
            setIsFocusInteracted(true);
        };
        if(isFocusInteracted) {
            trigger("focus");
        };
    }, [focus, isFocusInteracted, trigger]);
    
    //essa é a função que o handleMemberSubmit recebe como argumento, 
    //ela será executada quando o formulário do usuário membro for enviado.
    //ela recebe como argumento os dados do formulário.
    async function onMemberSubmit(memberData) {
        setIsLoading(true);
        try{
            memberData.userType = "membro";
            memberData.memberEmail = memberData.memberEmail.toLowerCase();
            const { memberName, memberEmail, memberPassword, userType } = memberData;
            const response = await api.post("/users/register", { 
                nome: memberName, 
                email: memberEmail, 
                senha: memberPassword, 
                tipo: userType 
            });
            toast({
                title: "Conta criada.",
                description: "Sua conta foi criada com sucesso!",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate("/entrar");
            }, 2000);
        } catch (error) {
            console.error("Erro ao enviar os dados de cadastro do membro:", error.response?.data || error);
            if(error.response && error.response.status === 400) {
                toast({
                    title: "E-mail em uso",
                    description: "Este e-mail já está cadastrado. Por favor, utilize outro e-mail.",
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
            }
        } finally {
            setIsLoading(false);
        };
    };

    //essa é a função que o handleNutritionistSubmit recebe como argumento, 
    //ela será executada quando o formulário do usuário nutricionista for enviado.
    //ela recebe como argumento os dados do formulário.
    async function onNutritionistSubmit(nutritionistData) {
        setIsLoading(true);
        const translateFocusToPortuguese = {
            vegan: "vegana",
            vegetarian: "vegetariana",
            veganAndVegetarian: "vegana_e_vegetariana"
        };
        try{
            nutritionistData.userType = "nutricionista";
            nutritionistData.nutritionistEmail = nutritionistData.nutritionistEmail.toLowerCase();
            const { nutritionistName, nutritionistEmail, crn, education, focus, nutritionistPassword, userType } = nutritionistData;
            const translatedFocus = translateFocusToPortuguese[focus];
            const response = await api.post("/users/register", {
                nome: nutritionistName,
                email: nutritionistEmail,
                crn,
                formacao: education,
                foco: translatedFocus,
                senha: nutritionistPassword,
                tipo:userType
            });
            toast({
                title: "Conta criada.",
                description: "Sua conta foi criada com sucesso!",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate("/entrar");
            }, 2000);
        } catch(error) {
            console.error("Erro ao enviar os dados de cadastro do nutricionista:", error.response?.data || error);
            toast({
                title: "Erro ao Criar Conta.",
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
            <Box
                maxWidth="1440px"
                width="100%"
                margin="0 auto"
            >
                <Flex 
                    alignItems="center" 
                    justifyContent="center"
                    marginTop="155px"
                    marginRight={{md:"34px", lg:"0"}}
                    marginLeft={{md:"34px", lg:"0"}}
                >
                    <VStack>
                        <Text
                            fontSize={{base:"36px", md:"46px", lg:"48px"}}
                            fontWeight="bold"
                            align={{base:"center"}}
                        >
                            Crie a sua conta
                        </Text>

                        <Box
                            marginTop="54px"
                            position="relative"
                            display="flex"
                            alignItems="center"
                            width={{base:"250px", md:"300px", lg:"311px"}}
                            height="35px"
                            borderRadius="30px"
                            border="1px"
                            borderColor="#193C40"
                        >
                            <Box //esse box contém a cor de fundo deslizante
                                position="absolute"
                                top="0"
                                left={isMemberActive ? "0" : "50%"} //se o botão de membro estiver ativo a cor fica na esquerda
                                width="50%"
                                height="100%"
                                background="#219653"
                                borderRadius="30px"
                                transition="left 0.3s ease"
                            />
                                <Button
                                    flex="1"
                                    height="100%"
                                    background="transparent"
                                    borderRadius="30px"
                                    zIndex="1"
                                    color={isMemberActive ? "#FFFFFF" : "#193C40"}
                                    _hover={{ bg: "transparent" }}
                                    fontWeight="bold"
                                    onClick={() => setIsMemberActive(true)}
                                >
                                    Membro
                                </Button>

                                <Button
                                    flex="1"
                                    height="100%"
                                    background="transparent"
                                    borderRadius="30px"
                                    zIndex="1"
                                    color={!isMemberActive ? "#FFFFFF" : "#193C40"}
                                    _hover={{ bg: "transparent" }}
                                    fontWeight="bold"
                                    onClick={() => setIsMemberActive(false)}
                                >
                                    Nutricionista
                                </Button>
                            </Box>
                            {isMemberActive ? (
                                <form key="memberForm" onSubmit={handleMemberSubmit(onMemberSubmit)}> 
                                    <Input 
                                        type="hidden"
                                        {...registerMember("userType")}
                                    />
                                    <FormControl isInvalid={errorsMember.memberName}>
                                        <FormLabel marginTop="45px">Nome</FormLabel>
                                        <Input 
                                            type="text"
                                            {...registerMember("memberName")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsMember.memberName?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsMember.memberEmail}>
                                        <FormLabel marginTop="26px">E-mail</FormLabel>
                                        <Input 
                                            type="text"
                                            {...registerMember("memberEmail")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsMember.memberEmail?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsMember.memberPassword}>
                                        <FormLabel marginTop="26px">Senha</FormLabel>
                                        <Input 
                                            type="password"
                                            {...registerMember("memberPassword")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsMember.memberPassword?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsMember.memberConfirmPassword}>
                                        <FormLabel marginTop="26px">Confirme sua senha</FormLabel>
                                        <Input 
                                            type="password"
                                            {...registerMember("memberConfirmPassword")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsMember.memberConfirmPassword?.message}</FormErrorMessage>
                                    </FormControl> 

                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        marginTop="38px"
                                        marginBottom="94px"
                                    >
                                        <Button
                                            width="207px"
                                            height="40px"
                                            borderRadius="25px"
                                            background="#219653"
                                            color="#FFFFFF"
                                            fontWeight="medium"
                                            type="submit"
                                            isLoading={isLoading}
                                        >
                                            Criar Conta
                                        </Button>
                                    </Box>
                                </form>
                            ) : (
                                <form key="nutritionistForm" onSubmit={handleNutritionistSubmit(onNutritionistSubmit)}>
                                    <Input 
                                        type="hidden"
                                        {...registerNutritionist("userType")}
                                    />
                                    <FormControl isInvalid={errorsNutritionist.nutritionistName}>
                                        <FormLabel marginTop="45px">Nome</FormLabel>
                                        <Input 
                                            type="text"
                                            {...registerNutritionist("nutritionistName")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsNutritionist.nutritionistName?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsNutritionist.nutritionistEmail}>
                                        <FormLabel marginTop="26px">E-mail</FormLabel>
                                        <Input
                                            type="email"
                                            {...registerNutritionist("nutritionistEmail")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsNutritionist.nutritionistEmail?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsNutritionist.crn}>
                                        <FormLabel marginTop="26px">CRN</FormLabel>
                                        <Input
                                            type="text"
                                            {...registerNutritionist("crn")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsNutritionist.crn?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsNutritionist.education}>
                                        <FormLabel marginTop="26px">Formação</FormLabel>
                                        <Input
                                            type="text"
                                            {...registerNutritionist("education")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsNutritionist.education?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsNutritionist.focus}>
                                        <FormLabel marginTop="26px">Foco em</FormLabel>
                                        <Box alignSelf="flex-start">
                                            <RadioGroup value={watch("focus")} onChange={(value) => setValue("focus", value)}>
                                                <Stack direction="column">
                                                    <Radio value="vegan">Nutrição Vegana</Radio>
                                                    <Radio value="vegetarian">Nutrição Vegetariana</Radio>
                                                    <Radio value="veganAndVegetarian">Nutrição Vegana e Vegetariana</Radio>
                                                </Stack>
                                            </RadioGroup>
                                        </Box>
                                        <FormHelperText width={{base:"280px", md:"340px", lg:"360px"}} marginTop="16px">
                                            *Interesse em compartilhar conteúdos focados em nutrição vegana, vegetariana ou ambos.
                                        </FormHelperText>
                                        <FormErrorMessage>{errorsNutritionist.focus?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsNutritionist.nutritionistPassword}>
                                        <FormLabel marginTop="26px">Senha</FormLabel>
                                        <Input
                                            type="password"
                                            {...registerNutritionist("nutritionistPassword")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsNutritionist.nutritionistPassword?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={errorsNutritionist.nutritionistConfirmPassword}>
                                        <FormLabel marginTop="26px">Confirme sua senha</FormLabel>
                                        <Input
                                            type="password"
                                            {...registerNutritionist("nutritionistConfirmPassword")}
                                            width={{base:"280px", md:"340px", lg:"360px"}} 
                                            height="38px"
                                            borderRadius="4px"
                                            border="1px"
                                            borderColor="#CED4DA"
                                        />
                                        <FormErrorMessage>{errorsNutritionist.nutritionistConfirmPassword?.message}</FormErrorMessage>
                                    </FormControl>
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        marginTop="38px"
                                        marginBottom="94px"
                                    >
                                        <Button
                                            width="207px"
                                            height="40px"
                                            borderRadius="25px"
                                            background="#219653"
                                            color="#FFFFFF"
                                            fontWeight="medium"
                                            type="submit"
                                            isLoading={isLoading}
                                        >
                                            Criar Conta
                                        </Button>
                                    </Box>
                                </form>
                            )}
                    </VStack>
                </Flex>

            </Box>
        </>
    );
};

export default SignUpPage;