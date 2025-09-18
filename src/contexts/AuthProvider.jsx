import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { Center, Spinner } from "@chakra-ui/react";
import { jwtDecode } from "jwt-decode";

//esse é o provedor de autenticação, ele irá fornecer o contexto de autenticação para toda a aplicação.

function AuthProvider({ children }) {
    //variável de estado que armazena se o usuário está autenticado.
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    //variável de estado que armazena as informações do usuário.
    const [user, setUser] = useState(null);

    const storedProfilePicture = localStorage.getItem("profilePicture");

    //função para decodificar e renomear as variáveis do token.
    const decodeToken = (token) => {
        const decodedToken = jwtDecode(token);
        return {
            id: decodedToken.id,
            type: decodedToken.tipo,
            name: decodedToken.nome,
            profilePicture: storedProfilePicture || decodedToken.fotoPerfil
        };
    };

    //o hook useEffect será executado apenas uma vez, quando o componente AuthProvider for carregado.
    //ele é responsavel por verificar se existe um token no localStorage e,
    //com base nessa informação definir o estado de autenticação do usuário
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if(token) {
            const userData = decodeToken(token);
            setUser(userData);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        };
    }, []);

    const setAuthToken = (token) => {
        localStorage.setItem("jwtToken", token);
        const userData = decodeToken(token);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        setIsAuthenticated(false);
    };

    return(
        <AuthContext.Provider value={{ isAuthenticated, setAuthToken, logout, user, setUser }}>
            {isAuthenticated === null ? (
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
            ) : (
                //quando o estado de autenticação for verificado os filhos do provider serão renderizados.
                children
            )}
        </AuthContext.Provider>
    );
};

export default AuthProvider;