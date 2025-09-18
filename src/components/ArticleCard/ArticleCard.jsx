import { Card, CardHeader, CardBody, Text, Avatar, Grid, GridItem } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function ArticleCard({ article }) {

    const navigate = useNavigate();

    const [formattedPublicationDate, setFormattedPublicationDate] = useState("");

    useEffect(() => {
        if(article) {
            if(article.publicationDate) {
                let formatted = format(new Date(article?.publicationDate), "dd MMM, yyyy", { locale: ptBR });
                setFormattedPublicationDate(formatted);
            };
        };
    }, [article]);

    return(
        <>
            <Link to={`/artigos/${article?.id}`} >
                <Card 
                    background="#219653" 
                    borderRadius="18px"  
                    width="100%"
                    height="436px"
                    paddingRight={{base:"10px", md:"30px"}} 
                    paddingLeft={{base:"19px", md:"30px"}}
                    paddingBottom="61px" 
                    color="#FFFFFF"
                >
                    <CardHeader
                        paddingTop="58px"
                        paddingBottom={{base:"75px", md:"99px"}} 
                    >
                        <Text fontWeight="light" fontSize="12px">
                            {formattedPublicationDate}
                        </Text>
                    </CardHeader>
                    <CardBody>
                        <Grid 
                            templateRows="repeat(2, 1fr)" 
                            templateColumns="auto 1fr"
                            columnGap="15px"
                        >
                            <GridItem rowSpan={2} colSpan={1}>
                                <Avatar 
                                    size='md' 
                                    name={article?.nutritionistName}
                                    src={article?.nutritionistProfilePicture}
                                    onClick={(event) => {
                                        event.preventDefault(); 
                                        navigate(`/perfil/${article.nutritionistId}`)
                                    }}
                                />
                            </GridItem>

                            <GridItem rowSpan={1} colSpan={1}>
                                <Text 
                                    fontWeight="light"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1, 
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {article?.nutritionistName}
                                </Text>
                            </GridItem>

                            <GridItem rowSpan={1} colSpan={1}>
                               {article?.nutritionistFocus === "vegana" ? (
                                    <Text fontWeight="light">
                                        Nutrição Vegana
                                    </Text>
                                ) : article?.nutritionistFocus === "vegetariana" ? (
                                    <Text fontWeight="light">
                                        Nutrição Vegetariana
                                    </Text>
                                ) : article?.nutritionistFocus === "vegana_e_vegetariana" && (
                                    <Text fontWeight="light">
                                        Nutrição Vegana e Vegetariana
                                    </Text>
                                )} 
                            </GridItem>
                        </Grid>

                        <Text 
                            fontWeight="bold" 
                            fontSize={{base:"20px", md:"24px"}}  
                            marginTop="48px"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {article?.title}
                        </Text>
                    </CardBody>
                </Card>
            </Link>
        </>
    );
};

export default ArticleCard;