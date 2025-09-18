import { 
    Box, 
    Flex, 
    Stack,  
    VStack, 
    Button, 
    Input, 
    InputGroup, 
    InputLeftElement, 
    Icon,
    Menu,
    MenuButton,
    MenuList,
    FormControl,
    FormErrorMessage,
    Textarea,
    Text,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Checkbox,
    MenuItem,
    IconButton,
    useToast,
    RadioGroup,
    Radio
} from "@chakra-ui/react";
import { ChevronDownIcon, TimeIcon, DeleteIcon } from "@chakra-ui/icons";
import ImageUpload from "../components/ImageUpload/ImageUpload";
import InputMask from "react-input-mask";
import { useEffect, useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import useAxios from "../hooks/useAxios";
import useAuthContext from "../hooks/useAuthContext";

//esquema de validação dos dados da receita
const recipeSchemaValidation = yup
    .object({
        recipeTitle:
            yup.string()
            .required("O título da receita é obrigatório")
            .trim()
            .max(150, "O título da receita deve ter no máximo 150 caracteres")
            .min(5, "O título da receita deve ter no mínimo 5 caracteres"),
        recipeSummary:
            yup.string()
            .required("O resumo da receita é obrigatório")
            .trim()
            .max(300, "O resumo da receita deve ter no máximo 300 caracteres")
            .min(20, "O resumo da receita deve ter no mínimo 20 caracteres"),
        servings:
            yup.number()
            .required("O rendimento da receita é obrigatório")
            //transforma valores não numéricos ou vazios em undefined para que o yup acione a validação do required,
            //assim irá aparecer a mensagem de erro que eu especifiquei e não a padrão do yup
            .transform(value => (isNaN(value) || value === "" ? undefined : value))
            .min(1, "O rendimento mínimo da receita é de 1 porção")
            .max(30, "O rendimento máximo da receita é de 30 porções"),
        preparationTime:
            yup.string()
            .required("O tempo de preparo da receita é obrigatório")
            //com o método matches do yup é possível aplicar regex para validar o formato de horário do tempo de preparo
            //regex é um padrão para buscar ou validar textos que seguem uma estrutura específica
            .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "O tempo de preparo deve estar no formato Hora:Minuto"),
        breakfast:
            yup.boolean(),
        snacksAndDesserts:
            yup.boolean(),
        lunchAndDinner:
            yup.boolean(),
        categories:
            yup.mixed()
            .test("categories", "Pelo menos uma opção deve ser selecionada", function() {
                const { breakfast, snacksAndDesserts, lunchAndDinner } = this.parent;
                return breakfast || snacksAndDesserts || lunchAndDinner;
            }),
        typeOfDiet:
            yup.string()
            .oneOf(["vegan", "vegetarian"], "Selecione uma opção válida")
            .required("Pelo menos uma opção deve ser selecionada"),
        ingredients:
            yup.array().of(
                yup.object().shape({
                    value:
                        yup.string()
                        .trim()
                        .required("O ingrediente e sua quantidade são obrigatórios")
                        .min(5, "O ingrediente e sua quantidade devem ter no mínimo 5 caracteres")
                        .max(45, "O ingrediente e sua quantidade devem ter no máximo 45 caracteres")
                })
            ),
        preparationSteps:
            yup.array().of(
                yup.object().shape({
                    value:
                        yup.string()
                        .required("A etapa do modo de preparo é obrigatória")
                        .trim()
                        .min(10, "A etapa do modo de preparo deve ter no mínimo 10 caracteres")
                        .max(500, "A etapa do modo de preparo deve ter no máximo 500 caracteres")
                })
            ),
        recipeImage: 
            yup.mixed()
            .required("A imagem é obrigatória")
    }).required();

function CreateRecipePage() {
    
    const { register, handleSubmit, trigger, watch, control, setValue, clearErrors, formState:{ errors } } = useForm({
        resolver: yupResolver(recipeSchemaValidation),
        //define um default value para ingredients, garantindo que ao carregar a página,
        //um input de ingrediente seja renderizado, sem a necessidade de clicar no botão de adicionar
        defaultValues: {
            ingredients: [{ value: "" }],
            preparationSteps: [{ value: "" }]
        }
    });

    //utilizando o método watch do react-hook-form para monitorar qualquer mudança em um dos campos abaixo.
    const breakfast = watch("breakfast");
    const snacksAndDesserts = watch("snacksAndDesserts");
    const lunchAndDinner = watch("lunchAndDinner");

    //variável de estado que indica se houve alguma interação com o menu de categorias, ou seja,
    //se alguma opção dentro do menu foi selecionada.
    const [isCategoryMenuInteracted, setIsCategoryMenuInteracted] = useState(false);

    //essa função tem como objetivo monitorar mudanças no menu de categorias e acionar a validação
    //do campo categories sempre que uma opção é selecionada
    useEffect(() => {
        if(breakfast || snacksAndDesserts || lunchAndDinner) {
            setIsCategoryMenuInteracted(true);
        };
        if(isCategoryMenuInteracted) {
            trigger("categories"); //aciona a validação do campo categories
        };    
    },[breakfast, snacksAndDesserts, lunchAndDinner, trigger, isCategoryMenuInteracted]);


    const typeOfDiet = watch("typeOfDiet");

    const [isTypeOfDietMenuInteracted, setIsTypeOfDietMenuInteracted] = useState(false);

    useEffect(() => {
        if(typeOfDiet) {
            setIsTypeOfDietMenuInteracted(true);
        };
        if(isTypeOfDietMenuInteracted) {
            trigger("typeOfDiet");
        };
    }, [typeOfDiet, isTypeOfDietMenuInteracted, trigger]);

    
    //useFieldArray é um hook do react-hook-form que permite lidar dinamicamente com campos dentro de um array.
    //fiels retorna o conteúdo do vetor ingredients.
    //append adiciona um novo campo ao vetor.
    const { fields, append, remove } = useFieldArray({
        //control ajuda a controlar e monitorar campos do formulário, ele é necessário para que o react-hook-form
        //consiga entender os novos inputs de ingredientes que aparecem dinamicamente.
        control,
        //é o nome do vetor onde as informações serão armazenadas
        name: "ingredients"
    });

    const { fields: fieldsPreparationSteps, append: appendPreparationSteps, remove: removePreparationSteps } = useFieldArray({
        control,
        name: "preparationSteps"
    });

    const { isOpen, onOpen, onClose } = useDisclosure(); //propriedades para controlar a visibilidade do modal de confirmação de publicação da receita

    const [recipeData, setRecipeData] = useState(null);

    const { user } = useAuthContext();

    function validatePageData(data) {
        setRecipeData(data);
        if(data) {
            onOpen();
        } else {
            onClose();
        };
    };

    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();

    const navigate = useNavigate();

    const api = useAxios();

    async function onRecipeSubmit() {
        setIsLoading(true);

        const translateTypeOfDietToPortuguese = {
            vegan: "vegano",
            vegetarian: "vegetariano"
        };

        try{
            const {
                recipeImage,
                breakfast,
                snacksAndDesserts,
                lunchAndDinner,
                typeOfDiet,
                preparationTime,
                servings,
                recipeTitle,
                recipeSummary,
                ingredients,
                preparationSteps
            } = recipeData

            const translatedTypeOfDiet = translateTypeOfDietToPortuguese[typeOfDiet];

            const categories = [
                breakfast && "cafe",
                snacksAndDesserts && "lanche_sobremesa",
                lunchAndDinner && "almoco_jantar"
            ].filter(Boolean);

            const userId = user?.id;

            const formData = new FormData();
            formData.append("idUsuario", userId);
            formData.append("imagem", recipeImage);
            formData.append("categoria", JSON.stringify(categories));
            formData.append("alimentacao", (translatedTypeOfDiet));
            formData.append("tempo", preparationTime);
            formData.append("rendimento", servings);
            formData.append("nome", recipeTitle);
            formData.append("introducao", recipeSummary);
            formData.append("ingrediente", JSON.stringify(ingredients));
            formData.append("modoDePreparo", JSON.stringify(preparationSteps));
            
            const response = await api.post("recipes/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            let recipeId = response.data.idReceita;

            toast({
                title: "Receita publicada com sucesso!",
                description: "Sua receita já está no ar.",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            setTimeout(() => {
                navigate(`/receitas/${recipeId}`);
            }, 2000);
        } catch(error) {
            console.error("Erro ao cadastrar receita:", error.response?.data || error);
            toast({
                title: "Erro ao publicar receita.",
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
                <form onSubmit={handleSubmit(validatePageData)}>

                    <Flex 
                        alignItems="center" 
                        justifyContent="center"
                        marginTop={{base:"100px", md:"185px"}} 
                        marginRight={{md:"34px", lg:"0"}}
                        marginLeft={{md:"34px", lg:"0"}}
                    >
                        <Box width={{base:"100%", md:"700px", lg:"800px"}}>
                            <FormControl isInvalid={errors.recipeImage}>
                                <ImageUpload 
                                    withBorderRadius={{base: false, md: true}}
                                    registerImage={(file) => {
                                        //define o arquivo selecionado pelo usuário como valor do campo "recipeImage"
                                        setValue("recipeImage", file);
                                        //limpa erros de validação do campo "recipeImage", se houver
                                        clearErrors("recipeImage");
                                    }}
                                />
                                <FormErrorMessage justifyContent="center">
                                    {errors.recipeImage?.message}
                                </FormErrorMessage>
                            </FormControl>
                        </Box>
                    </Flex>

                    <Flex
                        alignItems="center" 
                        justifyContent="center"
                        marginTop="40px"
                        marginRight={{base:"34px", lg:"0"}}
                        marginLeft={{base:"34px", lg:"0"}}
                    >
                        <Stack marginBottom={"20px"} direction={{base:"column", md:"row"}}>                       
                            <Stack 
                                spacing={{base:"10px", lg:"24px"}} 
                                marginRight={{base:"0", md:"10px", lg:"24px"}} 
                                marginBottom={{base:"10px", md:"0"}}
                                direction={{base:"column", md:"row"}} 
                            >
                                <FormControl isInvalid={errors.categories}>
                                    <Menu closeOnSelect={false}>
                                        <MenuButton 
                                            as={Button}
                                            rightIcon={<ChevronDownIcon />}
                                            width={{base:"235px", md:"180px", lg:"255px"}} 
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
                                            <MenuItem>
                                                <Checkbox {...register("breakfast")}>Café da Manhã</Checkbox>
                                            </MenuItem>
                                            <MenuItem>
                                                <Checkbox {...register("snacksAndDesserts")}>Lanches e Sobremesas</Checkbox>
                                            </MenuItem>
                                            <MenuItem>
                                                <Checkbox {...register("lunchAndDinner")}>Almoço e Jantar</Checkbox>
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                    <FormErrorMessage width={{base:"235px", md:"180px", lg:"255px"}}>
                                        {errors.categories?.message}
                                    </FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.typeOfDiet}>
                                    <Menu closeOnSelect={false}>
                                        <MenuButton
                                            as={Button}
                                            rightIcon={<ChevronDownIcon />}
                                            width={{base:"235px", md:"180px", lg:"255px"}}
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
                                            <MenuItem>
                                                <RadioGroup value={watch("typeOfDiet")} onChange={(value) => setValue("typeOfDiet", value)}>
                                                    <Stack direction="column">
                                                        <Radio value="vegan">Vegana</Radio>
                                                        <Radio value="vegetarian">Vegetariana</Radio>
                                                    </Stack>
                                                </RadioGroup>
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                    <FormErrorMessage width={{base:"235px", md:"180px", lg:"255px"}}>
                                        {errors.typeOfDiet?.message}
                                    </FormErrorMessage>
                                </FormControl>
                            </Stack>

                            <Stack 
                                direction={{base:"column", md:"row"}} 
                                spacing={{base:"10px", lg:"24px"}} 
                            >
                                <FormControl isInvalid={errors.preparationTime}>
                                    <InputGroup>
                                        <InputLeftElement textAlign="center">
                                            <TimeIcon color="#219653" width="32px" height="32px" marginTop="12px" marginRight="8px" />
                                        </InputLeftElement>
                                        <Input 
                                            {...register("preparationTime")}
                                            variant="flushed"
                                            as={InputMask}
                                            mask="99:99"
                                            width={{base:"235px", md:"198px", lg:"215px"}} 
                                            height="55px"
                                            placeholder="Tempo de Preparo"
                                            borderBottom="1px"
                                        />
                                    </InputGroup>
                                    <FormErrorMessage width={{base:"235px", md:"198px", lg:"215px"}}>
                                        {errors.preparationTime?.message}
                                    </FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.servings}>
                                    <InputGroup>
                                        <InputLeftElement textAlign="center">
                                            <Icon as={GiKnifeFork} color="#219653" width="32px" height="32px" marginTop="12px" marginRight="5px" />
                                        </InputLeftElement>
                                        <Input
                                            {...register("servings")}
                                            variant="flushed"
                                            type="number"
                                            width={{base:"235px", md:"150px", lg:"154px"}} 
                                            height="55px"
                                            placeholder="Rendimento"
                                            borderBottom="1px"
                                        />
                                    </InputGroup>
                                    <FormErrorMessage width={{base:"235px", md:"150px", lg:"154px"}}>
                                        {errors.servings?.message}
                                    </FormErrorMessage>
                                </FormControl>
                            </Stack>
                        </Stack> 
                    </Flex>
                    
                    <Flex
                        alignItems="center" 
                        justifyContent="center"
                        marginTop="85px"
                        marginRight={{base:"34px", lg:"0"}}
                        marginLeft={{base:"34px", lg:"0"}}
                    >
                        <VStack width="882px">
                            <FormControl isInvalid={errors.recipeTitle}>
                                <Input 
                                    {...register("recipeTitle")}
                                    type="text"
                                    autoFocus //para focar o input assim que ele for renderizado
                                    variant="unstyled"
                                    placeholder="Insira aqui o título da receita"
                                    height="50px"
                                    fontSize={{base:"20px", md:"36px"}} 
                                    fontWeight="bold"
                                />
                                <FormErrorMessage>
                                    {errors.recipeTitle?.message}
                                </FormErrorMessage>
                            </FormControl>
                        
                            <FormControl isInvalid={errors.recipeSummary}>
                                <Textarea 
                                    {...register("recipeSummary")}
                                    placeholder="Insira aqui um breve resumo sobre a receita" 
                                    marginTop="28px"
                                    height="250px"
                                    borderRadius="20px"
                                />
                                <FormErrorMessage>
                                    {errors.recipeSummary?.message}
                                </FormErrorMessage>
                            </FormControl>
                           
                            <Box 
                                alignSelf="flex-start" 
                                marginTop="85px"
                                width={{md:"682px", lg:"882px"}}
                            >
                                <Text fontSize={{base:"28px", md:"36px", lg:"40px"}}> 
                                    Ingredientes 
                                </Text> 
                                <VStack 
                                    marginTop="28px"
                                    spacing="24px"
                                >
                                    {fields.map((field, index) => {
                                        return(
                                            <HStack width="100%" key={field.id}>
                                                <FormControl isInvalid={errors.ingredients?.[index]?.value}>
                                                    <Input 
                                                        {...register(`ingredients.${index}.value`)}
                                                        type="text"
                                                        placeholder={`Ingrediente ${index + 1} e quantidade`}
                                                        variant="unstyled"
                                                        width={{md:"632px", lg:"832px"}}
                                                    />
                                                    <FormErrorMessage>
                                                        {errors.ingredients?.[index]?.value?.message}
                                                    </FormErrorMessage>
                                                </FormControl>
                                                {index >= 1 && (
                                                    <IconButton 
                                                        icon={<DeleteIcon width="18px" height="18px"/>}
                                                        width="40px"
                                                        height="40px"
                                                        onClick={() => remove(index)}
                                                    />
                                                )}
                                            </HStack>
                                        )
                                    })}
                                </VStack>
                                <Button 
                                    onClick={() => append({ value: "" })} //ao clicar no botão será adicionado um novo input com o valor inicial vazio
                                    marginTop="24px"
                                    variant="unstyled"
                                    color="#828282"
                                >
                                    Adicionar opção
                                </Button>
                            </Box>
                            
                            <Box
                                alignSelf="flex-start"
                                marginTop="85px"
                            >
                                <Text fontSize={{base:"28px", md:"36px", lg:"40px"}}>
                                    Modo de Preparo
                                </Text>
                           
                                {fieldsPreparationSteps.map((field, index) => {
                                    return(
                                        <Stack 
                                            direction="row" 
                                            marginBottom="60px"
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
                                                    marginTop="46px"
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
                                            <FormControl key={field.id} isInvalid={errors.preparationSteps?.[index]?.value}>
                                                <Stack marginBottom="20px">
                                                    <Textarea 
                                                        {...register(`preparationSteps.${index}.value`)}
                                                        marginTop="60px"
                                                        width={{base:"220px", md:"648px", lg:"698px"}}  
                                                        height={{base:"200px", md:"120px"}} 
                                                        variant="unynstyled"
                                                        placeholder={`Etapa ${index + 1} do modo de preparo`}
                                                    />
                                                    <FormErrorMessage marginLeft="18px">
                                                        {errors.preparationSteps?.[index]?.value?.message}
                                                    </FormErrorMessage>
                                                </Stack>
                                            </FormControl>
                                            {index >= 1 &&(
                                                <IconButton 
                                                    icon={<DeleteIcon width="18px" height="18px"/>}
                                                    width="40px"
                                                    height="40px"
                                                    onClick={() => removePreparationSteps(index)}
                                                    marginTop="60px"
                                                />
                                            )}
                                        </Stack>
                                    )
                                })}
                                <Stack 
                                    direction="row" 
                                    marginBottom="85px"
                                    spacing={{base:"35px", md:"55px"}} 
                                    borderBottom="1px"
                                    borderColor="#BDBDBD"
                                >
                                    <Stack>
                                        <Button 
                                            background="#D9D9D9"
                                            width={{base:"61px", md:"71px"}} 
                                            height={{base:"61px", md:"71px"}}
                                            borderRadius="50%"
                                            onClick={() => appendPreparationSteps([{ value: "" }])}
                                        >
                                            <Text
                                                fontSize="24px"
                                                color="#FFFFFF"
                                                fontWeight="extrabold"
                                            >
                                                +
                                            </Text>
                                        </Button>
                                    </Stack>
                                    <Stack>
                                        <Text marginTop="14px" color="#828282" marginBottom="60px">
                                            Adicionar Etapa
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Box>
                            
                            <Box
                                alignSelf="flex-end"
                                marginBottom={{base:"135px", md:"235px"}} 
                            >
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
                                        Publicar Receita
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
                                                    Tem certeza que deseja publicar essa receita?
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
                                                    Depois de publicar, você não poderá editar esta receita. Para fazer alterações, será necessário
                                                    excluí-la e criar uma nova.
                                                </Text>
                                                <VStack spacing="18px" marginTop="30px">
                                                    <Button
                                                        onClick={onRecipeSubmit}
                                                        width="245px"
                                                        height="40px"
                                                        borderRadius="25px"
                                                        background="#219653"
                                                        fontWeight="medium"
                                                        color="#FFFFFF"
                                                        isLoading={isLoading}
                                                    >
                                                        Sim, publicar receita!
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
                                
                            </Box>
                            
                        </VStack>
                    
                    </Flex>

                </form>
            </Box>
        </>
    );
};

export default CreateRecipePage;