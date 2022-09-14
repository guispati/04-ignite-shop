import { GetServerSideProps } from "next";
import Image from "next/future/image";
import Head from "next/head";
import Link from "next/link";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { ImageContainer, ImageListContainer, SuccessContainer } from "../styles/pages/success";

interface SuccessProps {
    customerName: string;
    productList: {
        name: string;
        imageUrl: string;
    }[];
}

export default function Success({ customerName, productList }: SuccessProps) {
    return (
        <>
            <Head>
				<title>Compra efetuada | Ignite Shop</title>

                <meta name="robots" content="noindex" />
			</Head>

            <SuccessContainer>
                <ImageListContainer>
                    {productList.map(product => {
                        return (
                            <ImageContainer key={product.name}>
                                <Image src={product.imageUrl} alt='' width={120} height={120} />
                            </ImageContainer>
                        )
                    })}
                </ImageListContainer>

                <h1>Compra efetuada!</h1>
                
                <p>
                    Uhuul, <strong>{customerName}</strong>, sua compra de {productList.length} camiseta{productList.length !== 1 && 's'} já está a caminho da sua casa.
                </p>

                <Link href="/">
                    Voltar ao catálogo
                </Link>
            </SuccessContainer>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    if (!query.session_id) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const sessionId = String(query.session_id);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product']
    });

    const customerName = session.customer_details.name;
    const products = session.line_items.data.map(product => {
        return product.price.product as Stripe.Product;
    });

    const productList = products.map(product => {
        return {
            name: product.name,
            imageUrl: product.images[0],
        };
    });

    return {
        props: {
            customerName,
            productList,
        }
    };
};