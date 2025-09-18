import { 
    Box, 
    Avatar, 
    Text, 
    Button, 
    Stack, 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalCloseButton,
    useDisclosure, 
    Image, 
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { EditIcon } from "@chakra-ui/icons";
import { VscDeviceCamera } from "react-icons/vsc";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";

function ProfileHeader({ isEditingProfile, userData, selectUserPicture, onUploadUserPicture, isLoading }) {

    const { user } = useAuthContext();

    //propriedades para controlar a visibilidade do modal de edição de foto de perfil e de capa.
    const { isOpen, onOpen, onClose } = useDisclosure();

    //variável de estado que armazena se o botão "Editar Capa" que está presente dentro do modal foi clicado.
    //se o botão foi clicado o seu valor será "true" e irá aparecer o layout para editar a foto de capa.
    //se o botão não foi clicado o seu valor será "false" e irá aparecer o layout para editar a foto de perfil.
    //o valor default da variável está como "false" pois assim que o modal for aberto sempre irá aparecer a edição de foto de perfil primeiro.
    const [isEditCoverActive, setIsEditCoverActive] = useState(false);

    const [errorMessageProfilePicture, setErrorMessageProfilePicture] = useState("");
    const [errorMessageCoverPicture, setErrorMessageCoverPicture] = useState("");

    //essas duas variáveis de estado servem para exibir uma preview da imagem de perfil e de capa.
    const [previewProfilePicture, setPreviewProfilePicture] = useState(null);
    const [previewCoverPicture, setPreviewCoverPicture] = useState(null);

    //essas duas variáveis de estado servem para recriar os inputs de seleção de arquivos
    //isso é útil pois sempre que um arquivo for selecionado os inputs irão ter um novo valor,
    //isso permitirá que o mesmo arquivo possa ser selecionado mais de uma vez, pois o React irá identificá-lo como um arquivo diferente.
    const [fileInputKeyProfilePicture, setFileInputKeyProfilePicture] = useState(0);
    const [fileInputKeyCoverPicture, setFileInputKeyCoverPicture] = useState(0);


    //essa função é chamada quando um arquivo é selecionado para a foto de perfil.
    //ela captura e manipula apenas os arquivos que atendem aos seguintes critérios de aceitação definidos:
    // - arquivos com extensão JPG ou JPEG
    const onDropProfilePicture = (acceptedFiles) => {  
        
        if(previewProfilePicture) {
            URL.revokeObjectURL(previewProfilePicture); //libera o espaço de memória ocupado por uma URL anterior
        };
       
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            selectUserPicture(file, "profilePicture");
            const newPreview = URL.createObjectURL(file); //cria uma URL temporária para a imagem que o usuário inserir, permitindo assim a sua exibição no navegador

            setPreviewProfilePicture(newPreview);
            setFileInputKeyProfilePicture(state => state + 1); //atualiza o valor do fileInputKey para o valor atual do estado + 1.
            setErrorMessageProfilePicture("");
        };
    };

    //essa função é chamada quando um arquivo é selecionado para a foto de capa. ela segue a mesma lógica da função onDropProfilePicture
    const onDropCoverPicture = (acceptedFiles) => {
        if(previewCoverPicture) {
            URL.revokeObjectURL(previewCoverPicture);
        };

        if(acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            selectUserPicture(file, "coverPicture");
            const newPreview = URL.createObjectURL(file);

            setPreviewCoverPicture(newPreview);
            setFileInputKeyCoverPicture(state => state + 1);
            setErrorMessageCoverPicture("");
        };
    };


    //essa função é chamada quando um arquivo que não atende aos critérios de aceitação definidos é selecionado para a foto de perfil.
    const onDropRejectedProfilePicture = (rejectedFiles) => {

        rejectedFiles.forEach(file => {
            //cada arquivo rejeitado tem uma propriedade chamada errors, que contém os detalhes dos erros,
            //incluindo o código do erro.
            const err = file.errors.map((error) => {
                if(error.code === "file-invalid-type") {
                    return "Tipo de arquivo não aceito. Por favor, envie apenas imagens no formato JPG ou JPEG.";
                };

                if(error.code === "file-too-large") {
                    return "O arquivo é muito grande. O tamanho máximo permitido é de 3 MB.";
                };

                //mensagem padrão para erros desconhecidos
                return "Erro inesperado! Verifique se o arquivo é compatível (formato JPG, JPEG, até 3 MB) e tente novamente."
            });
          
            setErrorMessageProfilePicture(err);
        });
    };

    //essa função é chamada quando um arquivo que não atende aos critérios de aceitação definidos é selecionado para a foto de capa.
    const onDropRejectedCoverPicture = (rejectedFiles) => {

        rejectedFiles.forEach(file => {
            //cada arquivo rejeitado tem uma propriedade chamada errors, que contém os detalhes dos erros,
            //incluindo o código do erro.
            const err = file.errors.map((error) => {
                if(error.code === "file-invalid-type") {
                    return "Tipo de arquivo não aceito. Por favor, envie apenas imagens no formato JPG ou JPEG.";
                };

                if(error.code === "file-too-large") {
                    return "O arquivo é muito grande. O tamanho máximo permitido é de 3 MB.";
                };

                //mensagem padrão para erros desconhecidos
                return "Erro inesperado! Verifique se o arquivo é compatível (formato JPG, JPEG, até 3 MB) e tente novamente."
            });
          
            setErrorMessageCoverPicture(err);
        });
    };


    //configuração do hook useDropZone especificamente para o upload de foto de perfil
    const { getRootProps: getRootProfilePictureProps, getInputProps: getInputProfilePictureProps } = useDropzone({
        onDrop: onDropProfilePicture, //quando o evento onDrop ocorrer a função onDropProfilePicture será executada
        onDropRejected: onDropRejectedProfilePicture, //quando o evento onDropRejected ocorrer a função onDropRejectedProfilePicture será executada
        noDrag: true, //desabilita a funcionalidade de arrastar e soltar a imagem
        accept: { //tipos de arquivos que são permitidos
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxFiles: 1, //quantidade máxima de arquivos aceitos
        //definindo um tamanho máximo de 3 MB por arquivo. o react-dropzone aceita apenas que o valor seja passado em bytes, por isso o cálculo 
        //converte megabytes para bytes.
        maxSize: 3 * 1024 * 1024
    });

    //configuração do hook useDropZone especificamente para o upload de foto de capa
    const { getRootProps: getRootCoverPictureProps, getInputProps: getInputCoverPictureProps } = useDropzone({
        onDrop: onDropCoverPicture,
        onDropRejected: onDropRejectedCoverPicture,
        noDrag: true, 
        accept: { 
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxFiles: 1,
        maxSize: 3 * 1024 * 1024
    });

    const isValidCoverPicture = userData?.coverPicture && !userData?.coverPicture.includes("null");
    
    return(
        <>
            <Box 
                width="100%"
                height={{base:"200px", md:"266px"}}
                borderRadius={{base:"0", md:"10px"}}
                background={isValidCoverPicture ? "transparent" : "#D3D3D3"}
            > 
                {isValidCoverPicture && (
                    <Image 
                        src={userData?.coverPicture}
                        objectFit="cover"
                        height="100%"
                        width="100%"
                        borderRadius={{base:"0", md:"10px"}}
                    />
                )}
            </Box>           
            {userData?.id === user?.id && (
                <Box position="relative">
                    <Box 
                        position="absolute" 
                        right="0"
                        marginTop={{base:"10px", md:"27px"}} 
                        marginRight={{base:"5px", md:"0"}}
                    >
                        {!isEditingProfile ? (
                            <Link to={`/editar-perfil/${userData?.id}`}>
                                <Button
                                    leftIcon={<EditIcon />}
                                    width={{base:"100px", md:"147px", lg:"167px"}} 
                                    height="44px"
                                    border="1px"
                                    borderColor="#000000"
                                    borderRadius="4px"
                                    background="transparent"
                                    fontSize={{base:"13px",md:"16px", lg:"18px"}} 
                                    fontWeight="light"
                                >
                                    Editar perfil
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                leftIcon={<VscDeviceCamera />}
                                width={{base:"100px", md:"200px", lg:"227px"}}
                                height="44px"
                                border="1px"
                                borderColor="#000000"
                                borderRadius="4px"
                                background="transparent"
                                fontSize={{base:"13px",md:"16px", lg:"18px"}} 
                                fontWeight="light"
                                whiteSpace="normal"
                                padding="0"
                                onClick={onOpen}
                            >
                                <Stack direction={{base:"column", md:"row"}} spacing="0">
                                    <Box>
                                        Editar foto
                                    </Box>
                                    <Box>
                                        &nbsp;e capa
                                    </Box>
                                </Stack>
                            </Button>
                        )}
                    </Box>
                </Box>                   
            )}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay /> 
                <ModalContent
                    maxWidth={{base:"350px", md:"700px", lg:"900px"}} 
                    height={{base:"600px", md:"674px"}} 
                    borderRadius="20px"
                    padding="0"
                    paddingTop="0"
                >
                    <ModalHeader
                        padding="0"
                        borderBottom="1px"
                        borderColor="#828282"
                    >
                        <Stack direction="row" spacing="0">
                            <Button
                                width="50%"
                                height={{base:"79px", md:"99px"}} 
                                borderTopRadius="20px"
                                borderBottomRadius="0"
                                variant="unstyled"
                                fontSize={{base:"20px", md:"28px", lg:"32px"}} 
                                fontWeight="bold"
                                backgroundColor={isEditCoverActive ? "none" : "#E0E0E0"}
                                onClick={() => setIsEditCoverActive(false)}
                            >
                                Editar Foto
                            </Button>
                            <Button
                                width="50%"
                                height={{base:"79px", md:"99px"}} 
                                borderTopRadius="20px"
                                borderBottomRadius="0"
                                variant="unstyled"
                                fontSize={{base:"20px", md:"28px", lg:"32px"}} 
                                fontWeight="bold"
                                backgroundColor={isEditCoverActive ? "#E0E0E0" : "none"}
                                onClick={() => setIsEditCoverActive(true)}
                            >
                                Editar Capa
                            </Button>
                        </Stack>
                    </ModalHeader>
                    <ModalCloseButton color="#000000" size="lg"/>
                    <ModalBody padding="0">
                        {!isEditCoverActive ? (
                            <>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    marginTop={errorMessageProfilePicture ? "73px" : "93px"}  
                                    marginBottom="76px"
                                >
                                    {previewProfilePicture ? (
                                        <Avatar 
                                            src={previewProfilePicture}
                                            name=""
                                            width={{base:"135px", md:"245px", lg:"265px"}}
                                            height={{base:"135px", md:"245px", lg:"265px"}}
                                        />
                                    ) : (
                                        <Avatar 
                                            src={userData?.profilePicture}
                                            name={userData?.name}
                                            width={{base:"135px", md:"245px", lg:"265px"}}
                                            height={{base:"135px", md:"245px", lg:"265px"}}
                                        />
                                    )}

                                    <Text
                                        marginTop="27px"
                                        fontWeight="light"
                                        color="#000000"
                                    >
                                        Recomendação: 720x720 px
                                    </Text>

                                    {errorMessageProfilePicture && (
                                        <Text 
                                            color="red" 
                                            align={"center"} 
                                            marginTop="15px"
                                            marginRight="15px"
                                            marginLeft="15px"
                                            fontSize={{base:"14px", md:"16px"}}
                                            textAlign="center"
                                        > 
                                            {errorMessageProfilePicture} 
                                        </Text>
                                    )}
                                    
                                    {previewProfilePicture ? (
                                        <VStack>
                                            <Button
                                                leftIcon={<VscDeviceCamera />}
                                                marginTop={errorMessageProfilePicture ? "21px" : "41px"} 
                                                width={{base:"155px", md:"195px"}} 
                                                height="44px"
                                                border="1px"
                                                borderColor="#000000"
                                                borderRadius="4px"
                                                background="transparent"
                                                fontSize={{base:"16px", md:"20px"}} 
                                                fontWeight="light"
                                                color="#000000"
                                                {  ...getRootProfilePictureProps()} //função da biblioteca responsável por configurar o elemento que servirá como a área de seleção de arquivos
                                            >
                                                <input 
                                                    key={fileInputKeyProfilePicture} //toda vez que uma nova imagem for selecionada a key terá um novo valor e o input será resetado e recriado
                                                    {...getInputProfilePictureProps()} //função da biblioteca responsável por abrir a janela do explorador de arquivos e por selecionar e armazenar o arquivo no input. esse input não é visível
                                                />
                                                Alterar imagem
                                            </Button>
                                            <Button
                                                width={{base:"155px", md:"195px"}} 
                                                height="44px"
                                                borderRadius="4px"
                                                border="1px"
                                                borderColor="#219653"
                                                background="#219653"
                                                fontSize={{base:"16px", md:"20px"}} 
                                                fontWeight="light"
                                                color="#FFFFFF"
                                                onClick={ async () => {
                                                    await onUploadUserPicture();
                                                    setTimeout(() => setPreviewProfilePicture(null), 200);
                                                }}
                                                isLoading={isLoading}
                                            >
                                                Salvar
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <Button
                                            leftIcon={<VscDeviceCamera />}
                                            marginTop={errorMessageProfilePicture ? "21px" : "41px"} 
                                            width={{base:"155px", md:"175px"}} 
                                            height="44px"
                                            border="1px"
                                            borderColor="#000000"
                                            borderRadius="4px"
                                            background="transparent"
                                            fontSize={{base:"16px", md:"20px"}} 
                                            fontWeight="light"
                                            color="#000000"
                                            {...getRootProfilePictureProps()}
                                        >
                                            <input {...getInputProfilePictureProps()}/>
                                            Editar foto
                                        </Button>
                                    )}
                                   
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box
                                    marginTop={errorMessageProfilePicture ? "73px" : "93px"}  
                                    marginBottom="111px"
                                    marginRight={{base:"20px", md:"70px"}} 
                                    marginLeft={{base:"20px", md:"70px"}} 
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                >
                                    {previewCoverPicture ? (
                                        <Box 
                                            width="100%"
                                            height="190px"
                                            backgroundImage={previewCoverPicture}
                                            backgroundSize="cover"
                                            backgroundPosition="center"
                                            backgroundRepeat="no-repeat"
                                            borderRadius="10px"
                                        />
                                    ) : (
                                        <Box 
                                            width="100%"
                                            height="190px"
                                            borderRadius="10px"
                                            background={isValidCoverPicture ? "transparent" : "#D3D3D3"}
                                        >
                                            {isValidCoverPicture && (
                                                <Image 
                                                    src={userData?.coverPicture}
                                                    width="100%"
                                                    height="100%"
                                                    objectFit="cover"
                                                    borderRadius="10px"
                                                />
                                            )}
                                        </Box>
                                    )}
                                    
                                    <Text
                                        marginTop={{base:"27px", md:"41px"}} 
                                        fontWeight="light"
                                        color="#000000"
                                    >
                                        Recomendação: 1300x270 px
                                    </Text>

                                    {errorMessageCoverPicture && (
                                        <Text 
                                            color="red" 
                                            align={"center"} 
                                            marginTop="15px"
                                            marginRight="15px"
                                            marginLeft="15px"
                                            fontSize={{base:"14px", md:"16px"}}
                                            textAlign="center"
                                        > 
                                            {errorMessageCoverPicture} 
                                        </Text>
                                    )}

                                    {previewCoverPicture ? (
                                        <VStack>
                                            <Button
                                                leftIcon={<VscDeviceCamera />}
                                                marginTop={errorMessageCoverPicture ? "21px" : "41px"} 
                                                width={{base:"155px", md:"195px"}} 
                                                height="44px"
                                                border="1px"
                                                borderColor="#000000"
                                                borderRadius="4px"
                                                background="transparent"
                                                fontSize={{base:"16px", md:"20px"}} 
                                                fontWeight="light"
                                                color="#000000"
                                                {  ...getRootCoverPictureProps()} 
                                            >
                                                <input 
                                                    key={fileInputKeyCoverPicture} 
                                                    {...getInputCoverPictureProps()} 
                                                />
                                                Alterar imagem
                                            </Button>

                                            <Button
                                                width={{base:"155px", md:"195px"}} 
                                                height="44px"
                                                borderRadius="4px"
                                                border="1px"
                                                borderColor="#219653"
                                                background="#219653"
                                                fontSize={{base:"16px", md:"20px"}} 
                                                fontWeight="light"
                                                color="#FFFFFF"
                                                onClick={ async () => {
                                                    await onUploadUserPicture();
                                                    setTimeout(() => setPreviewCoverPicture(null), 200);
                                                }}
                                                isLoading={isLoading}
                                            >
                                                Salvar
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <Button
                                            leftIcon={<VscDeviceCamera />}
                                            marginTop={errorMessageCoverPicture ? "21px" : "41px"}
                                            width={{base:"155px", md:"175px"}}
                                            height="44px"
                                            border="1px"
                                            borderColor="#000000"
                                            borderRadius="4px"
                                            background="transparent"
                                            fontSize={{base:"16px", md:"20px"}}
                                            fontWeight="light"
                                            color="#000000"
                                            {...getRootCoverPictureProps()}
                                        >
                                            <input {...getInputCoverPictureProps()}/>
                                            Editar capa
                                        </Button>
                                    )}
                                </Box>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Box 
                display="flex"
                justifyContent="center"
                marginTop={{base:"-67px", md:"-122px", lg:"-132px"}} //desloca o avatar para cima
            >
                <Avatar
                    src={userData?.profilePicture}
                    name={userData?.name}
                    width={{base:"135px", md:"245px", lg:"265px"}} 
                    height={{base:"135px", md:"245px", lg:"265px"}}
                />
            </Box>
            <Box 
                marginRight={{base:"34px", md:0}}
                marginLeft={{base:"34px", md:0}}
            >
                <Text 
                    align="center"
                    marginTop="22px"
                    fontSize={{base:"22px", md:"30px", lg:"40px"}}
                    fontWeight="bold"
                >
                    {userData?.name}
                </Text>
                {userData?.type === "nutricionista" && (
                    <>
                        {userData?.focus === "vegana" ? (
                            <Text
                                align="center"
                                marginTop="15px"
                                fontWeight="bold"
                                fontSize={{base:"14px", md:"16px"}}
                            >
                                Nutrição Vegana
                            </Text>
                        ) : userData?.focus === "vegetariana" ? (
                            <Text
                                align="center"
                                marginTop="15px"
                                fontWeight="bold"
                                fontSize={{base:"14px", md:"16px"}}
                            >
                                Nutrição Vegetariana
                            </Text>
                        ) : userData?.focus === "vegana_e_vegetariana" && (
                            <Text
                                align="center"
                                marginTop="15px"
                                fontWeight="bold"
                                fontSize={{base:"14px", md:"16px"}}
                            >
                                Nutrição Vegana e Vegetariana
                            </Text>
                        )}
                    </>
                )}
            </Box> 
        </>
    );
};

export default ProfileHeader;