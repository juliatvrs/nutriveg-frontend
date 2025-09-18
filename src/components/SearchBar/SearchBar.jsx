import { Input, InputLeftElement, InputGroup, HStack, Box, Button, Select, Flex, Text, FormErrorMessage, FormControl } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

function SearchBar({ title, onSearch, isSearchLoading, options, onChange, value, errorMessage, limit, placeholder, isSearchActive }) {

    const [searchValue, setSearchValue] = useState("");

    const [searchErrorMessage, setSearchErrorMessage] = useState("");

    function handleSearch() {
        if (searchValue === "") {
            setSearchErrorMessage("Insira um termo para realizar a pesquisa");
            return;
        };
        //0 é o offset inicial para exibir apenas os resultados da primeira página na pesquisa de receitas,
        //utilizado apenas no momento inicial da pesquisa.
        onSearch(searchValue.trim(), 0, limit);
    };

    useEffect(() => {
        if(!isSearchActive) {
            setSearchValue("");
        };
    }, [isSearchActive]);


    return(
        <>
            <Flex
                alignItems="center"
                justifyContent="center"
                marginTop="85px"
            >
                <Box width={{base:"300px", sm:"406px", md:"606px", lg:"906px"}}>
                    <Text
                        color="#193C40"
                        fontSize={{base:"24px", md:"38px", lg:"48px"}} 
                        fontWeight="bold"
                        marginBottom={{base:"24px", md:"34px"}} 
                    >
                        {title}
                    </Text>
                    <Box
                        height="auto" //a altura do box será ajustada com base em seu conteúdo
                        width="100%" //o box ocupará 100% da largura de seu componente pai
                    >
                        <Flex direction={{ base: "column", md: "row" }} align="center">
                            <HStack>
                                <FormControl isInvalid={searchErrorMessage}>
                                    <InputGroup width={{lg:"470px"}}  >
                                        <InputLeftElement pointerEvents="none">
                                            <SearchIcon />
                                        </InputLeftElement>
                                        <Input
                                            type="text"
                                            variant="flushed"
                                            placeholder="Digite sua busca"
                                            borderColor="#000000"
                                            value={searchValue}
                                            onChange={(e) => {
                                                setSearchValue(e.target.value); 
                                                setSearchErrorMessage("");
                                            }}
                                        />
                                    </InputGroup>
                                    {searchErrorMessage && (
                                        <FormErrorMessage>{searchErrorMessage}</FormErrorMessage>
                                    )}
                                </FormControl>
                                <Button
                                    background="#219653"
                                    color="#FFFFFF"
                                    borderRadius="25px"
                                    width={{base:"130px", md:"161px"}} 
                                    height="40px"
                                    marginRight={{base:"0", md:"25px"}} 
                                    fontSize={{base:"15px", md:"16px"}}
                                    onClick={handleSearch}
                                    isLoading={isSearchLoading}
                                >
                                    Pesquisar
                                </Button>
                            </HStack>
                            <Box 
                                width={{base:"100%", md:"240px"}}  
                                display={{ base: "block", md: "inline-block" }} 
                                marginTop={{base:"5px", md:"0"}}
                            >
                                <FormControl isInvalid={errorMessage}>
                                    <Select
                                        placeholder={placeholder}
                                        variant="filled"
                                        borderRadius="4px"
                                        border="1px"
                                        borderColor="#CED4DA"
                                        height="38px"
                                        onChange={(e) => onChange(e.target.value, 0, limit)}
                                        value={value}
                                    >
                                        {options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                    {errorMessage && (
                                        <FormErrorMessage>{errorMessage}</FormErrorMessage>
                                    )}
                                </FormControl>
                                
                            </Box>
                        </Flex>
                    </Box>
                </Box>
            </Flex>
        </>
    );
};

export default SearchBar;