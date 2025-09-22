import { MapaUniverso } from "./mapaUniverso"



export const Home = ({usuario, locaciones, setLocaciones}) => {
  return (
    <div className="pl-10 pr-5">
       <MapaUniverso usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones}></MapaUniverso>
    </div>
  )
}