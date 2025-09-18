import { 
    Box, 
    Text, 
    Stack, 
    Grid, 
    GridItem, 
    Textarea, 
    FormControl, 
    FormLabel, 
    Input,
    Button, 
    HStack, 
    RadioGroup,
    Radio,
    useToast,
    Center,
    Spinner,
    FormErrorMessage
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader/ProfileHeader";
import useAxios from "../hooks/useAxios";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAuthContext from "../hooks/useAuthContext";

const nutritionistSchemaValidation = yup.object({
    about:
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .min(50, "O texto deve ter no mínimo 50 caracteres")
        .max(500, "O texto deve ter no máximo 500 caracteres"),
    name:
        yup.string()
        .trim()
        .required("O nome é obrigatório")
        .min(2, "O nome deve ter no mínimo 2 caracteres")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    email:
        yup.string()
        .trim()
        .required("O e-mail é obrigatório")
        .email("Digite um e-mail válido")
        .max(150, "O e-mail deve ter no máximo 150 caracteres"),
    phone:
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .matches(/^\d{11}$/, "O telefone deve ter exatamente 11 dígitos"),
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
    website:
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .url("Informe um link válido")
        .max(500, "O link deve ter no máximo 500 caracteres"),
    instagram: 
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .matches(/^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+(?:\?[a-zA-Z0-9&=._-]*)?$/, "Informe um link válido do Instagram")
        .max(100, "O link do Instagram deve ter no máximo 100 caracteres"),
    linkedin:
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-áéíóúàèùáàãõç]+(?:\/)?$/, "Informe um link válido do LinkedIn")
        .max(150, "O link do LinkedIn deve ter no máximo 150 caracteres"),
    state:
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .min(2, "O estado deve ter no mínimo 2 caracteres")
        .max(45, "O estado deve ter no máximo 45 caracteres"),
    city:
        yup.string()
        .transform(value => (value.trim() === "" ? null : value))
        .nullable()
        .trim()
        .min(2, "A cidade deve ter no mínimo 2 caracteres")
        .max(100, "A cidade deve ter no máximo 100 caracteres")
}).required();

const memberSchemaValidation = yup.object({
    name:
        yup.string()
        .trim()
        .required("O nome é obrigatório")
        .min(2, "O nome deve ter no mínimo 2 caracteres")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    email:
        yup.string()
        .trim()
        .required("O e-mail é obrigatório")
        .email("Digite um e-mail válido")
        .max(150, "O e-mail deve ter no máximo 150 caracteres")
}).required();

function ProfileEditPage() {

    const { 
        register: registerNutritionist, 
        handleSubmit: handleNutritionistSubmit, 
        setValue: setNutritionistValue, 
        watch, 
        formState:{ errors: errorsNutritionist }
    } = useForm({
        resolver: yupResolver(nutritionistSchemaValidation),
        defaultValues: {
            focus: ""
        }
    });

    const { 
        register: registerMember, 
        handleSubmit: handleMemberSubmit, 
        formState: { errors: errorsMemeber 
    }} = useForm({
        resolver: yupResolver(memberSchemaValidation)
    });

    const { user, setUser } = useAuthContext();
    
    const api = useAxios();

    const { id } = useParams();

    const toast = useToast();

    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    async function fetchUserData() {
        try{
            const response = await api.get(`users/details/${id}`);
            setUserData(response.data.userData);
            setUser((prev) => ({ ...prev, profilePicture: response.data.userData.profilePicture }));
            localStorage.setItem("profilePicture", response.data.userData.profilePicture);
        } catch(error) {
            console.error("Erro ao receber dados do usuário: ", error.response?.data || error);
            navigate(`/perfil/${id}`);
            if(!toast.isActive("userDataToast")) {
                toast({
                    id: "userDataToast",
                    title: "Não foi possível carregar suas informações.",
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

    const [isUserPictureUpdated, setIsUserPictureUpdated] = useState(false);

    useEffect(() => {
        fetchUserData();
        if(isUserPictureUpdated) {
            setIsUserPictureUpdated(false);
        };
    }, [id, isUserPictureUpdated]);

    useEffect(() => {
        if(userData) {
            const focusTranslationMap = {
                vegana: "vegan",
                vegetariana: "vegetarian",
                vegana_e_vegetariana: "veganAndVegetarian"
            };

            const translatedFocus = focusTranslationMap[userData?.focus];
            setNutritionistValue("focus", translatedFocus);
        };
    }, [userData, setNutritionistValue]);

    const [isNutritionistProfileUpdateLoading, setIsNutritionistProfileUpdateLoading] = useState(false);

    async function onSubmitUpdateNutritionistProfile(nutritionistData) {
        setIsNutritionistProfileUpdateLoading(true);
        const translateFocusToPortuguese = {
            vegan: "vegana",
            vegetarian: "vegetariana",
            veganAndVegetarian: "vegana_e_vegetariana"
        };

        try {
            const { 
                about,
                name,
                email,
                phone,
                crn,
                education, 
                website,
                focus,
                instagram,
                linkedin,
                state,
                city
            } = nutritionistData;

            const translatedFocus = translateFocusToPortuguese[focus];
           
            const formData = new FormData();

            formData.append("about", about);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("crn", crn);
            formData.append("education", education);
            formData.append("website", website);
            formData.append("focus", translatedFocus);
            formData.append("instagram", instagram);
            formData.append("linkedin", linkedin);
            formData.append("state", state);
            formData.append("city", city);

            const userId = user?.id;

            const response = await api.put(`users/update-nutritionist/${id}/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            toast({
                title: "Seu perfil foi atualizado!",
                description: "As alterações foram salvas com sucesso.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate(`/perfil/${id}`);
            }, 2000);
        } catch(error) {
            console.error("Erro ao editar perfil do nutricionista: ", error.response?.data || error);
            if(error.response?.status === 403 && error.response?.data?.error === "Você não tem permissão para editar este perfil.") {
                toast({
                    title: "Ação não permitida.",
                    description: "Você não tem permissão para editar este perfil.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true
                });
            } else {
                toast({
                    title: "Erro ao atualizar perfil.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                });
            };
        } finally {
            setIsNutritionistProfileUpdateLoading(false);
        };
    };

    const [isMemberProfileUpdateLoading, setIsMemberProfileUpdateLoading] = useState(false);

    async function onSubmitUpdateMemberProfile(memberData) {
        setIsMemberProfileUpdateLoading(true);

        try {
            const { name, email } = memberData;

            const formData = new FormData();

            formData.append("name", name);
            formData.append("email", email);

            const userId = user?.id;

            const response = await api.put(`users/update-member/${id}/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            toast({
                title: "Seu perfil foi atualizado!",
                description: "As alterações foram salvas com sucesso.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate(`/perfil/${id}`);
            }, 2000);
        } catch(error) {
            console.error("Erro ao editar perfil do membro: ", error.response?.data || error);
            if(error.response?.status === 403 && error.response?.data?.error === "Você não tem permissão para editar este perfil.") {
                toast({
                    title: "Ação não permitida.",
                    description: "Você não tem permissão para editar este perfil.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true
                });
            } else {
                toast({
                    title: "Erro ao atualizar perfil.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                });
            };
        } finally {
            setIsMemberProfileUpdateLoading(false);
        };
    };

    const [userPicture, setUserPicture] = useState(null);

    const [isUserPictureUpdateLoading, setIsUserPictureUpdateLoading] = useState(false);

    function selectUserPicture(file, type) {
        if(!file) return;
        setUserPicture({ file, type });
    };

    async function handleUserPictureUpdate() {
        if(!userPicture) return;
        setIsUserPictureUpdateLoading(true);

        try {
            const formData = new FormData();

            formData.append(userPicture.type, userPicture.file);

            const userId = user?.id;

            const response = await api.put(`users/update-pictures/${id}/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            setIsUserPictureUpdated(true);

            toast({
                title: "Imagem atualizada!",
                description: "A imagem foi salva com sucesso.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
        } catch(error) {
            console.error("Erro ao editar foto do usuário: ", error.response?.data || error);
            if(error.response?.status === 403 && error.response?.data?.error === "Você não tem permissão para editar este perfil.") {
                toast({
                    title: "Ação não permitida.",
                    description: "Você não tem permissão para editar este perfil.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true
                });
            } else {
                toast({
                    title: "Erro ao atualizar imagem.",
                    description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                });
            };    
        } finally {
            setIsUserPictureUpdateLoading(false);
        };
    };
                                                                
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
                ) : userData && (
                    <>
                        {userData?.type === "nutricionista" ? (
                            <form key="nutritionistForm" onSubmit={handleNutritionistSubmit(onSubmitUpdateNutritionistProfile)}>
                                <Box
                                    marginTop={{base:"100px", md:"188px"}} 
                                    marginLeft={{base: "0", md:"34px", lg: "72px"}}  
                                    marginRight={{base: "0", md:"34px", lg: "72px"}}
                                >
                                    <ProfileHeader 
                                        isEditingProfile={true} 
                                        userData={userData}
                                        selectUserPicture={selectUserPicture}
                                        onUploadUserPicture={handleUserPictureUpdate}
                                        isLoading={isUserPictureUpdateLoading}
                                    />
                                </Box>
                                <Box
                                    marginLeft={{base:"34px", lg:"72px"}}
                                    marginRight={{base:"34px", lg:"72px"}}
                                    marginTop="85px"
                                >
                                    <Box
                                        width="100%"
                                        minHeight="322px"
                                        border="1px"
                                        borderColor={{base:"transparent", md:"#D9D9D9"}} 
                                        borderRadius="20px"
                                    >
                                        <Box
                                            marginTop="32px"
                                            marginLeft={{base:"26px", md:"66px", lg:"76px"}} 
                                            marginRight={{base:"26px", md:"66px", lg:"76px"}} 
                                        >
                                            <FormControl isInvalid={errorsNutritionist.about}>
                                                <FormLabel 
                                                    fontSize={{base:"20px", md:"24px", lg:"26px"}} 
                                                    fontWeight="bold"
                                                >
                                                    Sobre
                                                </FormLabel>
                                                    
                                                <Textarea
                                                    {...registerNutritionist("about")}
                                                    defaultValue={userData?.about}
                                                    marginTop="35px"
                                                    height={{base:"250px", md:"150px"}} 
                                                    border="1px"
                                                    borderColor="#D9D9D9"
                                                />
                                                <FormErrorMessage>{errorsNutritionist.about?.message}</FormErrorMessage>
                                            </FormControl>
                                        </Box>
                                    </Box>

                                    <Box
                                        marginTop="40px"
                                        width="100%"
                                        minHeight="793px"
                                        border="1px"
                                        borderColor={{base:"transparent", md:"#D9D9D9"}}
                                        borderRadius="20px"
                                        marginBottom="156px"
                                    >
                                        <Grid 
                                            templateColumns={{base:"1fr", md:"repeat(2, auto)"}}
                                            gap={{base:"41px", md:"51px", lg:"61px"}} 
                                            marginTop={{base:"45px", md:"117px"}} 
                                            marginBottom={{base:"0", md:"117px"}} 
                                            marginLeft={{base:"26px", lg:"0"}}
                                            marginRight={{base:"26px", lg:"0"}}
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.name}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Nome
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("name")}
                                                        type="text"
                                                        defaultValue={userData?.name}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}  
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.name?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.email}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        E-mail
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("email")}
                                                        type="text"
                                                        defaultValue={userData?.email}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.email?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.phone}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Telefone
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("phone")}
                                                        type="tel"
                                                        defaultValue={userData?.phone}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.phone?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.crn}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        CRN
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("crn")}
                                                        type="text"
                                                        defaultValue={userData?.crn}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.crn?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.education}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Formação
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("education")}
                                                        type="text"
                                                        defaultValue={userData?.education}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.education?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.website}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Site
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("website")}
                                                        type="text"
                                                        defaultValue={userData?.website}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.website?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <Text fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                    Foco em
                                                </Text>
                                                <Box alignSelf="flex-start">
                                                    <RadioGroup 
                                                        value={watch("focus")} 
                                                        onChange={(value) => setNutritionistValue("focus", value)}
                                                    >
                                                        <Stack direction="column" marginTop="10px">
                                                            <Radio value="vegan">Nutrição Vegana</Radio>
                                                            <Radio value="vegetarian">Nutrição Vegetariana</Radio>
                                                            <Radio value="veganAndVegetarian">Nutrição Vegana e Vegetariana</Radio>
                                                        </Stack>
                                                    </RadioGroup>
                                                </Box>
                                                <Text width={{base:"240px", md:"300px", lg:"330px"}} marginTop="16px" fontSize={"14px"} color="#4A5568">
                                                    *Interesse em compartilhar conteúdos focados em nutrição vegana, vegetariana ou ambos.
                                                </Text>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.instagram}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Instagram
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("instagram")}
                                                        type="text"
                                                        defaultValue={userData?.instagram}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.instagram?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.linkedin}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        LindedIn
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("linkedin")}
                                                        type="text"
                                                        defaultValue={userData?.linkedin}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.linkedin?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.state}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        UF
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("state")}
                                                        type="text"
                                                        defaultValue={userData?.state}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.state?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsNutritionist.city}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Cidade
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerNutritionist("city")}
                                                        type="text"
                                                        defaultValue={userData?.city}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsNutritionist.city?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem alignSelf="end">
                                                <HStack gap={{base:"10px", md:"15px", lg:"25px"}}>
                                                    <Button
                                                        width={{base:"84px", md:"94px"}} 
                                                        height="38px"
                                                        background="transparent"
                                                        border="1px"
                                                        borderRadius="4px"
                                                        borderColor="#6FCF97"
                                                        fontWeight="light"
                                                        color="#6FCF97"
                                                        onClick={() => navigate(`/perfil/${id}`)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        width={{base:"147px", md:"157px"}} 
                                                        height="38px"
                                                        background="#219653"
                                                        borderRadius="4px"
                                                        fontWeight="light"
                                                        color="#FFFFFF"
                                                        type="submit"
                                                        isLoading={isNutritionistProfileUpdateLoading}
                                                    >
                                                        Salvar alterações
                                                    </Button>
                                                </HStack>
                                            </GridItem>
                                        </Grid>  
                                    </Box>
                                </Box>
                            </form>
                                  
                        ) : (
                            <form key="memberForm" onSubmit={handleMemberSubmit(onSubmitUpdateMemberProfile)}>
                                <Box
                                    marginTop={{base:"100px", md:"188px"}} 
                                    marginLeft={{base: "0", md:"34px", lg: "72px"}}  
                                    marginRight={{base: "0", md:"34px", lg: "72px"}}
                                >
                                    <ProfileHeader 
                                        isEditingProfile={true} 
                                        userData={userData}
                                        selectUserPicture={selectUserPicture}
                                        onUploadUserPicture={handleUserPictureUpdate}
                                        isLoading={isUserPictureUpdateLoading}
                                    />
                                </Box>
                                <Box
                                    marginLeft={{base:"34px", lg:"72px"}}
                                    marginRight={{base:"34px", lg:"72px"}}
                                    marginTop="85px"    
                                >
                                    <Box
                                        marginBottom="118px"
                                        width="100%"
                                        minHeight="340px"
                                        border="1px"
                                        borderColor={{base:"transparent", md:"#D9D9D9"}}
                                        borderRadius="20px"
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Grid
                                            templateColumns={{base:"1fr", md:"repeat(2, auto)"}}
                                            gap={{base:"41px", md:"51px", lg:"61px"}} 
                                            marginTop={{base:"0", md:"117px"}} 
                                            marginBottom={{base:"0", md:"117px"}} 
                                        >
                                            <GridItem>
                                                <FormControl isInvalid={errorsMemeber.name}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        Nome
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerMember("name")}
                                                        type="text"
                                                        defaultValue={userData?.name}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}  
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsMemeber.name?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem>
                                                <FormControl isInvalid={errorsMemeber.email}>
                                                    <FormLabel fontSize={{base:"18px", md:"20px"}} fontWeight="light">
                                                        E-mail
                                                    </FormLabel>
                                                    <Input 
                                                        {...registerMember("email")}
                                                        type="text"
                                                        defaultValue={userData?.email}
                                                        width={{base:"240px", md:"300px", lg:"330px"}}
                                                        height="50px"
                                                        border="1px"
                                                        borderColor="#D9D9D9"
                                                        marginTop="10px"
                                                    />
                                                    <FormErrorMessage>{errorsMemeber.email?.message}</FormErrorMessage>
                                                </FormControl>
                                            </GridItem>

                                            <GridItem colSpan={{base:1, md:2}}>
                                                <HStack 
                                                    gap={{base:"10px", md:"15px", lg:"25px"}} 
                                                    justifyContent={{base:"flex-start", md:"flex-end"}} 
                                                >
                                                    <Button
                                                        width={{base:"84px", md:"94px"}} 
                                                        height="38px"
                                                        background="transparent"
                                                        border="1px"
                                                        borderRadius="4px"
                                                        borderColor="#6FCF97"
                                                        fontWeight="light"
                                                        color="#6FCF97"
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        width={{base:"147px", md:"157px"}} 
                                                        height="38px"
                                                        background="#219653"
                                                        borderRadius="4px"
                                                        fontWeight="light"
                                                        color="#FFFFFF"
                                                        type="submit"
                                                        isLoading={isMemberProfileUpdateLoading}
                                                    >
                                                        Salvar alterações
                                                    </Button>
                                                </HStack>
                                            </GridItem>
                                        </Grid>
                                    </Box>
                                </Box>
                            </form>
                        )}
                            
                    </>
                )}
            </Box>
        </>
    );
};

export default ProfileEditPage;