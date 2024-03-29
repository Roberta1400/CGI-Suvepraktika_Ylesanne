import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Istekohad.css';

function Istekohad({ saalId }) {
    const [istekohad, setIstekohad] = useState([]);
    const [valitudIstekohad, setValitudIstekohad] = useState([]);
    const [liigaPaljuPileteidValitud, setLiigaPaljuPileteidValitud] = useState(false);
    const [naitatsekki, setNaitaTsekki] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8080/api/v1/istekohad/${saalId}`)
            .then(response => response.json())
            .then(data => {
                setIstekohad(data);
            })
            .catch(error => {
                console.error('Error fetching istekohad:', error);
            });
    }, [saalId]);

    const groupIstekohadByReaNr = () => {
        const groupedIstekohad = {};
        istekohad.forEach(istekoht => {
            const { reaNr } = istekoht;
            if (!groupedIstekohad[reaNr]) {
                groupedIstekohad[reaNr] = [];
            }
            groupedIstekohad[reaNr].push(istekoht);
        });
        return groupedIstekohad;
    };

    const groupedIstekohad = groupIstekohadByReaNr();

    const handleClick = (valitudIstekoht) => {
        if (!valitudIstekoht.kasVõetud) {
            const onValitud = valitudIstekohad.some(istekoht => istekoht.id === valitudIstekoht.id);
            if (!onValitud) {
                const uuendatudValitudIstekohad = [...valitudIstekohad, valitudIstekoht];
                setValitudIstekohad(uuendatudValitudIstekohad);
            } else {
                const uuendatudValitudIstekohad = valitudIstekohad.filter(istekoht => istekoht.id !== valitudIstekoht.id);
                setValitudIstekohad(uuendatudValitudIstekohad);
            }
        }
    };
    
    const leiaKeskmineKoht = (istekohad, keskmineRidaIndeks) => {
        istekohad.sort((a, b) => a.reaNr - b.reaNr);

        const keskmiseReaIstekohad = istekohad.filter(istekoht => istekoht.reaNr === keskmineRidaIndeks + 1);

        if (keskmiseReaIstekohad.length > 0) {
    
            keskmiseReaIstekohad.sort((a, b) => a.kohaId - b.kohaId);

            const keskmineKohtIndeks = Math.floor(keskmiseReaIstekohad.length / 2);

            return keskmiseReaIstekohad[keskmineKohtIndeks];

        } else {
            return null; 
        }
    };

    const handleAddSeats = (arv, valitudIstekohad, istekohad) => {
        let updatedValitudIstekohad = [...valitudIstekohad]; 
        let saadavalolevadIstekohad = [...istekohad.filter(istekoht => !istekoht.kasVõetud && !updatedValitudIstekohad.includes(istekoht))];
        let keskmineReaNr = 2;
        let keskmineIstekoht;

        if (saadavalolevadIstekohad.length < arv) {
            console.log("Liiga palju pileteid valitud, pole nii palju vabu kohti!");
            setLiigaPaljuPileteidValitud(true);
            return;
        }
        while (arv > 0) {
        
            try {
                keskmineIstekoht = leiaKeskmineKoht(saadavalolevadIstekohad, keskmineReaNr);

            } catch (error) {
                console.error('Error kui prooviti otsida keskmist kohta:', error);

            }
            

            if (keskmineIstekoht !== null) {
                keskmineIstekoht = {...keskmineIstekoht, kasVõetud: true}; 
                updatedValitudIstekohad.push(keskmineIstekoht);

                
                saadavalolevadIstekohad = saadavalolevadIstekohad.filter(istekoht => istekoht.id !== keskmineIstekoht.id);

                arv--;
            } else {

                if (keskmineReaNr === 1) {
                    keskmineReaNr = 0; 
                } else if (keskmineReaNr > 3) {
                    keskmineReaNr = 1;
                } else {
                    keskmineReaNr++; 
                }
            }
        }
    
        setValitudIstekohad(updatedValitudIstekohad);
       
    };

    const handleRemoveSeat = (istekohtId) => {
        const updatedValitudIstekohad = valitudIstekohad.filter(istekoht => istekoht.id !== istekohtId);
        setValitudIstekohad(updatedValitudIstekohad);
    };

    const removeAllSeats = () => {
        const updatedIstekohad = istekohad.map(istekoht => {
            if (valitudIstekohad.some(selectedSeat => selectedSeat.id === istekoht.id)) {
                return {...istekoht, kasVõetud: false};
            } else {
                return istekoht;
            }
        });
        setIstekohad(updatedIstekohad);
        setValitudIstekohad([]);
    };

    const handleOstaPiletid = () => {
        const hind = valitudIstekohad.length * 5;
        console.log(`Tšekk: Kokkuhind - ${hind} eurot`);
       
        const requestBody = JSON.stringify( valitudIstekohad );
    
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        };
    
        console.log(requestOptions);
        fetch('http://localhost:8080/api/v1/istekohad/ostapiletid', requestOptions)
            .then(response => {
                if (response.ok) {
                    console.log('Piletid ostetud edukalt!');
                } else {
                    console.error('Viga piletite ostmisel:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Viga piletite ostmisel:', error);
            });
    };

    const handleNaitaTsekki = () => {
        setNaitaTsekki(true);
    };
    
    return (
        <div className="istekohad-container">
            {Object.keys(groupedIstekohad).map(reaNr => (
                <div key={reaNr} className="istekohad-rea-container">
                    {groupedIstekohad[reaNr].map(istekoht => (
                        <div
                            key={istekoht.id}
                            className={`istekoht ${istekoht.kasVõetud ? 'võetud' : 'vaba'} ${valitudIstekohad.some(Istekoht => istekoht.id === Istekoht.id) ? 'valitud' : ''}`}
                            onClick={() => handleClick(istekoht)}
                        >
                            {istekoht.kohaId}
                        </div>
                    ))}
                </div>
            ))}
            <div className="istekohad-toolbar">
                <h3>Lisa pilet:</h3>
                <button className="button" onClick={() => handleAddSeats(1, valitudIstekohad, istekohad)}>+1</button>
                <button className="button" onClick={() => handleAddSeats(2, valitudIstekohad, istekohad)}>+2</button>
                <button className="button" onClick={() => handleAddSeats(3, valitudIstekohad, istekohad)}>+3</button>
                <button className="button" onClick={() => handleAddSeats(4, valitudIstekohad, istekohad)}>+4</button>
                <button className="button" onClick={() => removeAllSeats()}>Del</button>
            </div>
            {liigaPaljuPileteidValitud && <p><b>Liiga palju pileteid valitud!</b></p>}
            {valitudIstekohad.length > 0 && (
                <div className="valitud-istekohad">
                    <p>Valitud istekohtade arv: {valitudIstekohad.length}</p>
                    {valitudIstekohad.map((istekoht, indeks) => (
                        <div key={indeks} className="valitud-istekoht" onClick={() => handleRemoveSeat(indeks)}>
                         
                        </div>
                    ))}
                <button className="buttonS" onClick={handleNaitaTsekki}>Tšekk</button>
                </div>
            )}
            {naitatsekki && (
                <div className="receipt">
                    <h2>Tšekk</h2>
                    <p>Kokkuhind: {valitudIstekohad.length * 5} eurot</p>
                    <Link to={`/seansid`} >
                    <button className="buttonS" onClick={() => handleOstaPiletid()}>Kinnita ost</button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Istekohad;