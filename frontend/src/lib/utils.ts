export function cn(...classes:(string|false|null|undefined)[]){
    return classes.filter(Boolean).join(" ")
}

export function formatPct(v:number){
    return `${(v*100).toFixed(2)}%`
}

export function formatBRL(v:number){
    return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v)
}

export function formatCompact(v:number){
    return new Intl.NumberFormat("pt-BR",{notation:"compact",maximumFractionDigits:1}).format(v)
}

export function recommendationTone(r:string){
    if(r.toLowerCase().includes("comprar")) return "success";
    if(r.toLowerCase().includes("analisar"))return "warning";
    return "danger"
}
