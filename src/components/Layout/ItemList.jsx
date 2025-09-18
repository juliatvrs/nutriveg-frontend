import { Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

function ItemList({ itens }) {
    return(
        <>
            <Stack 
                direction={{base: "column", lg: "row"}} 
                spacing={{base: "4px", lg: "30px"}}
            > 
                {itens.map((item, index) => (
                    <Link to={item.path} key={index}>
                        <Text color="#FFFFFF">
                            {item.text}
                        </Text>
                    </Link>
                    
                ))}
            </Stack>
        </>
    );
};

export default ItemList;

//essa funçao serve para percorrer e alterar os itens da lista