export default function SignupRedirectPage() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/login?mode=register',
      permanent: false,
    },
  };
}
