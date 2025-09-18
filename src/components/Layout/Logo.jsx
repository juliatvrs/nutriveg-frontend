import logoImage from "../../assets/img/logo-nutriveg.png";
import { Image } from '@chakra-ui/react';

function Logo() {
    return(
        <>
                <Image 
                    src={logoImage} 
                    alt='Logo da aplicação Nutriveg'
                    maxWidth={{base:"130px", md:"140px"}} 
                    maxHeight={{base:"50px", md:"60px"}} 
                    width="auto"
                    height="auto"
                />
        </>
    );
};

export default Logo;