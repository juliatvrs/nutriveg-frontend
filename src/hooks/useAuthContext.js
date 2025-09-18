import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function useAuthContext() {
    const context = useContext(AuthContext);

    if(context === undefined) {
        throw new Error("useAuthContext deve ser usado dentro do contexto de autenticação do AuthProvider.");
    };
    return context;
};

export default useAuthContext;

//esse é um hook customizado para acessar o contexto de autenticação