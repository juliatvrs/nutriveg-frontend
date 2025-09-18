import { Box, Button, Flex, Image, VStack, Text, useBreakpointValue } from "@chakra-ui/react";
import galleryImage from "../../assets/img/gallery.png";
import { useDropzone } from "react-dropzone";
import { useState } from "react";

function ImageUpload({ withBorderRadius, registerImage }) {

    const [errorMessage, setErrorMessage] = useState("");

    const [preview, setPreview] = useState(null);

    const [fileInputKey, setFileInputKey] = useState(0);

    const onDrop = (acceptedFiles) => { //onDrop é uma função para capturar e manipular os arquivos que ATENDEM aos critérios de aceitação definidos no código
        
        if(preview) {
            URL.revokeObjectURL(preview); //libera o espaço de memória ocupado por um URL anterior
        };
       
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            registerImage(file); //passa o arquivo selecionado pelo usuário para o formulário de seu pai via prop
            const newPreview = URL.createObjectURL(file); //cria uma URL temporária para a imagem que o usuário inserir, permitindo assim a sua exibição no navegador

            setPreview(newPreview);
            setFileInputKey(state => state + 1); //atualiza o valor do fileInputKey para o valor atual do estado + 1. serve para recriar o input
            setErrorMessage("");
        };
    }; 

    //onDropRejected é uma função para capturar e manipular os arquivos que NÃO atendem aos critérios de aceitação definidos no código
    const onDropRejected = (rejectedFiles) => {

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
          
            setErrorMessage(err);
        });
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        onDropRejected,
        noDrag: true, //desabilita a funcionalidade de arrastar e soltar a imagem
        accept: { //tipos de arquivos que são permitidos
            "image/jpeg": [".jpg", ".jpeg"],
        },
        maxFiles: 1, //quantidade máxima de arquivos aceitos
        //definindo um tamanho máximo de 3 MB por arquivo. o react-dropzone aceita apenas que o valor seja passado em bytes, por isso o cálculo 
        //converte megabytes para bytes.
        maxSize: 3 * 1024 * 1024
    });
    
    const borderRadius = useBreakpointValue(withBorderRadius); //obtém o valor de "withBorderRadius"(true ou false) com base no tamanho da tela atual(breakpoint)

    return(
        <>
            {preview ? (
                <>
                    <Box
                        width="100%" //o box irá ocupar sempre 100% da largura de seu componente pai
                        height={{base:"244px", md:"344px", lg:"444px"}}  
                        borderRadius={borderRadius ? "20px" : "none"}
                    >
                        <Image 
                            src={preview}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                            borderRadius={borderRadius ? "18px" : "none"}
                        />
                    </Box>
                    <Text 
                        color="red" 
                        align={"center"} 
                        marginTop={{base:"5px", md:"10px"}} 
                        marginRight={{base:"5px", md:"0"}}
                        marginLeft={{base:"5px", md:"0"}}
                        fontSize={{base:"14px", md:"16px"}}
                    > 
                        {errorMessage} 
                    </Text>
                    <Flex justifyContent="center" alignItems="center">
                        <Button 
                            {...getRootProps()} //função da biblioteca responsável por configurar o elemento que servirá como a área de seleção de arquivos
                            marginTop="10px"
                            borderRadius="30px"
                            background="#219653"
                            color="#FFFFFF"
                            fontWeight="light"
                        >
                            <input 
                                key={fileInputKey} //toda vez que uma nova imagem for selecionada a key terá um novo valor e o input será resetado e recriado
                                {...getInputProps()} //função da biblioteca responsável por abrir a janela do explorador de arquivos e por selecionar e armazenar o arquivo no input. esse input não é visível
                            />
                            Alterar imagem
                        </Button>
                    </Flex>
                </>
            ) : (
                <>
                    <Box
                        width="100%" //o box irá ocupar sempre 100% da largura de seu componente pai
                        height={{base:"300px", md:"400px"}} //o box irá ocupar sempre 100% da altura de seu componente pai
                        background="#E0E0E0"
                        border="1px"
                        borderColor="#4F4F4F"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius={borderRadius ? "20px" : "none"}         
                    >
                        <VStack spacing={{base:"18px", md:"37px", lg:"57px"}} >
                            <Image 
                                src={galleryImage}
                                alt="Ícone de galeria de imagens"
                                width="110px"
                                height="110px"
                            />
                            <Button
                                width={{base:"270px", md:"311px"}} 
                                height="39px"
                                borderRadius="30px"
                                background="#219653"
                                color="#FFFFFF"
                                fontWeight="light"
                                fontSize={{base:"15px", md:"16px"}}
                                {...getRootProps()} 
                            > 
                                <input {...getInputProps()}/>
                                Carregar imagem do Computador
                            </Button>
                            <Text 
                                color="red" 
                                align="center"
                                marginRight={{base:"5px", md:"0"}}
                                marginLeft={{base:"5px", md:"0"}}
                                fontSize={{base:"14px", md:"16px"}}
                            > 
                                {errorMessage} 
                            </Text>
                        </VStack>
                    </Box>
                </>
            )}  
        </>
    );
};

export default ImageUpload;