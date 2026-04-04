export default function AuthRedirectPage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
}
