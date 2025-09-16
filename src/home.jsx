import { MapaUniverso } from "./mapaUniverso"



export const Home = ({usuario, locaciones, setLocaciones}) => {
  return (
    <div className="container  pl-20 pr-20">
       <MapaUniverso usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones}></MapaUniverso>
    </div>
  )
}