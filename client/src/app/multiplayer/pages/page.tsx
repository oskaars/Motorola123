import Multiplayer from '../components/Multiplayer';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Chess Over LAN</h1>
      <Multiplayer />
    </div>
  );
};

export default Home;
