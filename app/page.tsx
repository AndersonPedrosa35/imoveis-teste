/* eslint-disable @next/next/no-img-element */
import { getDistance } from 'geolib';
import Link from 'next/link';

export const formataLatELng = ({ lat, lng }: { lat: number, lng: number }) => ({latitude: lat, longitude: lng})

const COORDENADAS_DE_CASA = {
  lat: -23.6374,
  lng: -46.4691
}

export type IRecords = {
  docName: string | null
  hdnImovel: string | null
  dataInsercao: string | null
  endereco: string | null
  bairro: string | null
  estado: string | null
  cidade: string | null
  tipoImovel: string | null
  precoAvaliacao: number
  precoVenda: number
  desconto: number
  modoVenda: string | null
  situacao: string | null
  aceitaFGTS: string | null
  aceitaConsorcio: string | null
  aceitaFinanciamentoHabitacional: string | null
  aceitaParcelamento: string | null
  temAcaoJudicial: string | null
  coordenadas: {
    lat: number,
    lng: number
  },
  siteLeiloeiro: string | null,
  vendedor: string | null,
  origemIntegracao: string,
  ativo: boolean,
  imagens: Array<
    {
      order: number,
      fileReference: string
    } | never
  >,
  dataUltimaAtualizacao: string | null,
  lancesDisputa: Array<{ value: number, date: string }>,
  datasConcorrencias: Record<'leilao_unico' | 'leilao_2' | 'leilao_1', {
    data_inicio: string | null,
    data_fim: string | null,
    local_leilao: string | null,
    site_leiloeiro: string | null,
    nome_leiloeiro: string | null,
    lance_minimo: number | null,
  }>
}

export type IResponseImoveis = {
  count: number,
  records: Array<IRecords | never>
}

export default async function Home() {
  const imoveis = await fetch('https://smartleiloescaixa.com.br/api/imoveis/busca', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "queryDataMode": "leilao",
      "estados": ["SP"],
      "max": 2400,
      "offset": 0,
      "countImoveis": true
    }),
  }).then(res => res.json()).then((res: IResponseImoveis) => res)
  .catch((err: any) => ({ count: 0, records: [] }))

  console.log({imoveis})
  return (
    <div>
      <h1 className='text-xl px-4 py-2'>Imovéis em Sp</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 px-4">
        {imoveis?.records?.sort(({ coordenadas: coodeA }, { coordenadas: coodeB }) => {
          if (coodeA?.lat && coodeA?.lng && coodeB?.lat && coodeB?.lng) {
            return getDistance(
              formataLatELng(COORDENADAS_DE_CASA),
              formataLatELng(coodeA)
            ) - getDistance(
              formataLatELng(COORDENADAS_DE_CASA),
              formataLatELng(coodeB)
            )
          } else {
            return 0
          }
        })?.map(
          ({ docName = '', cidade, estado, bairro, endereco, precoAvaliacao, precoVenda, imagens, lancesDisputa, datasConcorrencias, hdnImovel, origemIntegracao = '' }, idx: number) => (
          <div key={`${docName} ${idx}`} className='space-y-2'>
            <img className='w-[300px] max-h-[200px] object-cover' src={`https://storage.googleapis.com/imagens-imoveis-smart-leiloes/${imagens?.[0]?.fileReference ?? ''}`} alt='tet' />
            <p>{docName}</p>
            <p>{endereco} - {bairro}</p>
            <p>{cidade} - {estado}</p>
            <p><Link target='_blank' className='text-blue-500' href={`https://www.google.com/maps/place/${endereco?.split(' ').join('+')}`}>MAPS</Link></p>
            <p><Link target='_blank' className='text-blue-500' href={`https://smartleiloescaixa.com.br/leilao/${hdnImovel}/${origemIntegracao}`}>Leilão</Link></p>
            <p className='line-through text-xl'>{precoAvaliacao}</p>
            {lancesDisputa?.length > 0 ? <p className='text-xl'>{lancesDisputa?.[0]?.value}</p> : <p className='text-xl'>{precoVenda}</p>}
            <p className='text-sm'>Até {
              datasConcorrencias?.leilao_unico?.data_fim ? datasConcorrencias?.leilao_unico?.data_fim
              : datasConcorrencias?.leilao_2?.data_fim ? datasConcorrencias?.leilao_2?.data_fim
              : datasConcorrencias?.leilao_1?.data_fim ? datasConcorrencias?.leilao_2?.data_fim : 0
            }</p>
          </div>
        ))}
      </div>
    </div>
  );
}
