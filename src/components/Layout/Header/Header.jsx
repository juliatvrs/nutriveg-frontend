import { 
    Box, 
    Flex, 
    IconButton, 
    Drawer, 
    DrawerBody, 
    DrawerOverlay, 
    DrawerContent,
    DrawerCloseButton, 
    useDisclosure, 
    useBreakpointValue,
    Button,
    HStack,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import React from 'react';
import { HamburgerIcon, ChevronRightIcon, TriangleDownIcon, EditIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { MdArticle } from "react-icons/md";
import { HiUser } from "react-icons/hi2";
import { AiOutlineCloseSquare } from "react-icons/ai";
import Logo from "../Logo";
import ItemList from "../ItemList";
import { Link } from 'react-router-dom';
import useAuthContext from '../../../hooks/useAuthContext';

function Header() {

    const { isOpen, onOpen, onClose } = useDisclosure(); //hook para controlar se o drawer está aberto ou fechado
    const btnRef = React.useRef();

    const headerItens = [
        {text: "Início", path: "/"},
        {text: "Receitas", path: "/receitas"},
        {text: "Artigos", path: "/artigos"},
        {text: "Nutricionistas", path: "/nutricionistas"},
    ];

    const isMobile = useBreakpointValue({base: true, lg: false});

    const { isAuthenticated, logout, user } = useAuthContext();

    return(
        <>
            <Flex
                as="header"
                align="center"
                position="fixed"
                zIndex="1001"
                top="0" //para que a header fique sempre enconstada no topo
                bg='#193C40'
                w="100%"
                h="100px"
            >
                <Flex
                    justify="space-between"
                    maxWidth="1440px"
                    width="100%"
                    align={"center"}
                    margin={"0 auto"}
                    pr={{base:"14px", md:"34px", lg:"72px"}} 
                    pl={{base:"14px", md:"34px", lg:"72px"}}
                    pt="10px"
                    pb="10px"
                >
                    {!isMobile ? (
                        <>
                            <Box marginRight="20px">
                                <Link to="/">
                                    <Logo/>
                                </Link>
                            </Box>
                            <ItemList itens={headerItens}/>

                            {isAuthenticated ? (
                                <HStack spacing="0">
                                    <Avatar 
                                        width="66px"
                                        height="66px"
                                        name={user?.name}
                                        src={user?.profilePicture}
                                    />
                                    <Menu>
                                        {({ isOpen }) => (
                                            <>
                                                <MenuButton 
                                                    as={IconButton}
                                                    icon={isOpen ? <TriangleUpIcon width="15px" height="15px" /> : <TriangleDownIcon width="15px" height="15px" />}
                                                    variant="unstyled"
                                                    color="#FFFFFF"
                                                />
                                                <MenuList>
                                                    <Link to={`/perfil/${user?.id}`}>
                                                        <MenuItem icon={<HiUser size="16px" />} fontSize="20px">
                                                            Meu perfil
                                                        </MenuItem>
                                                    </Link>
                                                    <Link to="/criar-receita">
                                                        <MenuItem icon={<MdArticle size="16px" />} fontSize="20px">
                                                            Publicar Receita
                                                        </MenuItem>
                                                    </Link>
                                                    {user?.type === "nutricionista" && (
                                                        <Link to="/criar-artigo">
                                                            <MenuItem icon={<EditIcon width="14px" height="14px" />} fontSize="20px">
                                                                Escrever Artigo
                                                            </MenuItem>
                                                        </Link>
                                                    )}
                                                    <MenuItem icon={<AiOutlineCloseSquare size="16px" />} fontSize="20px" onClick={logout}>
                                                        Sair
                                                    </MenuItem>
                                                </MenuList>
                                            </>
                                        )}
                                    </Menu>
                                </HStack>
                            ) : (
                                <Link to="/entrar">
                                    <Button 
                                        rightIcon={<ChevronRightIcon />} 
                                        bg="#219653" 
                                        borderRadius="25px"
                                        fontWeight="normal"
                                        color="#F0FFF4"
                                        width="104px"
                                        height="40px"
                                    >
                                        Entrar
                                    </Button>
                                </Link>
                            )}  
                        </>

                    ) : (
                        <>
                            <HStack spacing="0">
                                <IconButton 
                                    ref={btnRef}
                                    icon={<HamburgerIcon />}
                                    onClick={onOpen}
                                    variant="unstyled"
                                    color="#F0FFF4"
                                />
                                <Link to="/">
                                    <Logo />
                                </Link>
                            </HStack>

                            <Drawer
                                isOpen={isOpen} //se for true o drawer aparece
                                placement="top"
                                onClose={onClose}
                                finalFocusRef={btnRef} //quando o drawer for fechado o foco estará no ícone do menu
                            >
                                <DrawerOverlay width="100%" height="100%" /> 
                                <DrawerContent bg="#193C40" p="30px">
                                    <DrawerCloseButton color="#FFFFFF" />
                                    <DrawerBody>
                                        <ItemList itens={headerItens} />
                                    </DrawerBody>
                                </DrawerContent>
                            </Drawer>

                            {isAuthenticated ? (
                                <HStack spacing="0" marginTop="10px">
                                    <Avatar 
                                        width={{base:"50px", md:"66px"}} 
                                        height={{base:"50px", md:"66px"}} 
                                        name={user?.name}
                                        src={user?.profilePicture}
                                    />
                                    <Menu>
                                        {({ isOpen }) => (
                                            <>
                                                <MenuButton 
                                                    as={IconButton}
                                                    icon={isOpen ? <TriangleUpIcon width="15px" height="15px" /> : <TriangleDownIcon width="15px" height="15px" />}
                                                    variant="unstyled"
                                                    color="#FFFFFF"
                                                />
                                                <MenuList>
                                                    <Link to={`/perfil/${user?.id}`}>
                                                        <MenuItem icon={<HiUser size="16px" />} fontSize="18px">
                                                            Meu perfil
                                                        </MenuItem>
                                                    </Link>
                                                    <Link to="/criar-receita">
                                                        <MenuItem icon={<MdArticle size="16px" />} fontSize="18px">
                                                            Publicar Receita
                                                        </MenuItem>
                                                    </Link>
                                                    {user?.type === "nutricionista" && (
                                                        <Link to="/criar-artigo">
                                                            <MenuItem icon={<EditIcon width="14px" height="14px" />} fontSize="18px">
                                                                Escrever Artigo
                                                            </MenuItem>
                                                        </Link>
                                                    )}
                                                    <MenuItem icon={<AiOutlineCloseSquare size="16px" />} fontSize="18px" onClick={logout}>
                                                        Sair
                                                    </MenuItem>
                                                </MenuList>
                                            </>
                                        )}
                                    </Menu>
                                </HStack>  
                            ) : (
                                <Link to="/entrar">
                                    <Button 
                                        rightIcon={<ChevronRightIcon />} 
                                        bg="#219653" 
                                        borderRadius="25px"
                                        fontWeight="normal"
                                        color="#F0FFF4"
                                        width={{base:"100px", md:"104px"}} 
                                        height={{base:"36px", md:"40px"}} 
                                    >
                                        Entrar
                                    </Button>
                                </Link> 
                            )}
                        </>

                    )}
                </Flex>
            </Flex>
        </>
    );
};

export default Header;