import { Box, HStack, IconButton, Button,} from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";

//quantidade máxima de botões que a paginação deverá ter.
const maxPaginationButtons = 5;

//quantidade máxima de botões que o lado esquerdo da paginação terá.
const maxLeftPaginationButtons = (maxPaginationButtons - 1) / 2;

function Pagination({ limit, totalItems, offset, handlePaginationChange }) {

    const currentPage = offset ? (offset / limit) + 1 : 1;

    //se utiliza o Math.ceil para arredondar o resultado para cima pois a quantidade total de páginas deve ser um número exato.
    const totalPages = Math.ceil(totalItems / limit);

    //essa variável define o número do primeiro botão da paginação.
    const firstPage = Math.max(
        Math.min(currentPage - maxLeftPaginationButtons, totalPages - maxPaginationButtons + 1),
        1
    );

    return(
        <>
            <Box
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                marginTop="85px"
                marginBottom="85px"
            >
                <HStack
                    height="40px"
                    spacing={{base:"6px", md:"13px"}}
                >
                    <IconButton 
                        icon={<ArrowLeftIcon />}
                        aria-label="Página anterior"
                        variant="outline"
                        borderColor="transparent"
                        color="#212529"
                        onClick={() => handlePaginationChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                    />
                    
                    {Array.from({ length: Math.min(maxPaginationButtons, totalPages) }).map((_, index) => {
                        //o _ é usado porque o argumento "item" não é necessário.
                        
                        //o index é incrementado pelo primeiro número do botão da paginação (firstPage),
                        //gerando assim os números das páginas.
                        const page = index + firstPage;
                        return(
                            <Button 
                                key={page}
                                variant="outline"
                                borderColor="#219653"
                                width="40px"
                                backgroundColor={page === currentPage ? "#219653" : "none"}
                                color={page === currentPage ? "white" : "black"}
                                onClick={() => handlePaginationChange(page)} 
                            >
                                {page}
                            </Button>
                        )
                    })} 

                    <IconButton 
                        icon={<ArrowRightIcon />}
                        aria-label="Próxima página"
                        variant="outline"
                        borderColor="transparent"
                        color="#212529"
                        onClick={() => handlePaginationChange(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                    />
                </HStack>
            </Box>
        </>
    );
};

export default Pagination;