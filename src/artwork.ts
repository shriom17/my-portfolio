// All artwork imports in one place — keeps App.tsx clean
import alanTuringImg from './assets/artwork/AlanTuring.jpg';
import kalamImg from './assets/artwork/apj-abdul-kalam-15.jpg';
import arijitSinghImg from './assets/artwork/Arijit Singh.jpg';
import armaanMalikImg from './assets/artwork/ARMAAN MALIK.jpg';
import indianFlagBoyImg from './assets/artwork/boy-indian-national-flag-green-grass-43060893.jpg';
import clgImg from './assets/artwork/clg.jpg';
import darshanImg from './assets/artwork/Darshan.jpg';
import dhoniImg from './assets/artwork/DHONI.jpg';
import gopalImg from './assets/artwork/GOPAL.png';
import hanumanImg from './assets/artwork/hanumanji.jpg';
import johanCruyffImg from './assets/artwork/johan-cruyff-footballer-coach-14-august-1994-HN8YNYjpg.jpg';
import maaDurgaImg from './assets/artwork/MAA DURGA.jpg';
import maaJagadhatriImg from './assets/artwork/Maa Jagadhatri.jpg';
import maaKaliJpegImg from './assets/artwork/MAA KALI.jpeg';
import maaKaliPngImg from './assets/artwork/MAA KALI.png';
import maaSaradaImg from './assets/artwork/MAA SARADA.jpg';
import maaaImg from './assets/artwork/Maaa.jpg';
import maaDurga2Img from './assets/artwork/maaDurga.jpg';
import maaKali2Img from './assets/artwork/maaKali.jpg';
import mahadevImg from './assets/artwork/MAHADEV.png';
import messiImg from './assets/artwork/messi.jpg';
import netajiImg from './assets/artwork/NETAJI.jpg';
import netaji2Img from './assets/artwork/NetajiD.jpg';
import pranabMukherjeeImg from './assets/artwork/Pranab Mukherjee.jpg';
import rabiThakurImg from './assets/artwork/Rabi Tthakur.jpg';
import rohitSharmaImg from './assets/artwork/rohit sharma.jpg';
import ronaldoImg from './assets/artwork/Ronaldo.jpg';
import rupamIslamImg from './assets/artwork/RupamIslam.jpg';
import sanamPuriImg from './assets/artwork/sanampuri-ms-paint portrait.jpg';
import satyajitRayImg from './assets/artwork/Satyajit Ray.jpg';
import sharodiyaImg from './assets/artwork/Sharodiya.jpg';
import soumitraChatterjeeImg from './assets/artwork/Soumitra Chatterjee.jpg';
import souravGangulyImg from './assets/artwork/Sourav Ganguly.jpg';
import ssrImg from './assets/artwork/SSR.jpg';
import sumedhImg from './assets/artwork/SUMEDH.jpg';
import vivekanandImg from './assets/artwork/swami vivekanand standing hd photo (2).jpg';
import vidyasagarImg from './assets/artwork/Vidyasagar.jpg';
import viratKohliImg from './assets/artwork/ViratKohli.jpg';

export interface Artwork {
  title: string;
  description: string;
  image: string;
  category: string;
}

export const drawings: Artwork[] = [
  { title: "Digital Portrait of Messi", description: "Digital art portrait of the football legend", image: messiImg, category: "Sports Art" },
  { title: "MS Dhoni Cricket Art", description: "Captain Cool in action - cricket artwork", image: dhoniImg, category: "Sports Art" },
  { title: "Lord Hanuman", description: "Spiritual artwork with devotional essence", image: hanumanImg, category: "Spiritual Art" },
  { title: "Netaji Subhas Chandra Bose", description: "Tribute artwork to the great freedom fighter", image: netaji2Img, category: "Historical Figures" },
  { title: "Maa Durga", description: "Divine goddess artwork with traditional essence", image: maaDurga2Img, category: "Spiritual Art" },
  { title: "Cristiano Ronaldo", description: "Football superstar digital portrait", image: ronaldoImg, category: "Sports Art" },
  { title: "Swami Vivekananda", description: "Portrait of the great spiritual leader", image: vivekanandImg, category: "Historical Figures" },
  { title: "APJ Abdul Kalam", description: "People's President tribute artwork", image: kalamImg, category: "Historical Figures" },
  { title: "Alan Turing", description: "Father of computer science and artificial intelligence", image: alanTuringImg, category: "Historical Figures" },
  { title: "Arijit Singh", description: "Voice of Bollywood - musical legend", image: arijitSinghImg, category: "Music Artists" },
  { title: "Armaan Malik", description: "Contemporary music sensation", image: armaanMalikImg, category: "Music Artists" },
  { title: "Patriotic Spirit", description: "Boy with Indian flag representing national pride", image: indianFlagBoyImg, category: "Patriotic Art" },
  { title: "College Memories", description: "Capturing college life moments", image: clgImg, category: "Personal Art" },
  { title: "Darshan", description: "Portrait artwork with spiritual essence", image: darshanImg, category: "Portraits" },
  { title: "Gopal", description: "Divine child Krishna artwork", image: gopalImg, category: "Spiritual Art" },
  { title: "Johan Cruyff", description: "Football legend and coach tribute", image: johanCruyffImg, category: "Sports Art" },
  { title: "Maa Jagadhatri", description: "Divine mother goddess artwork", image: maaJagadhatriImg, category: "Spiritual Art" },
  { title: "Maa Kali", description: "Fierce goddess of time and change", image: maaKaliJpegImg, category: "Spiritual Art" },
  { title: "Maa Kali - Divine Power", description: "Another interpretation of the divine mother", image: maaKaliPngImg, category: "Spiritual Art" },
  { title: "Maa Sarada", description: "Holy mother spiritual artwork", image: maaSaradaImg, category: "Spiritual Art" },
  { title: "Divine Mother", description: "Spiritual essence of motherhood", image: maaaImg, category: "Spiritual Art" },
  { title: "Maa Durga - Alternate", description: "Another beautiful rendition of goddess Durga", image: maaDurgaImg, category: "Spiritual Art" },
  { title: "Maa Kali - Artistic Vision", description: "Artistic interpretation of divine power", image: maaKali2Img, category: "Spiritual Art" },
  { title: "Mahadev", description: "Lord Shiva - the supreme deity", image: mahadevImg, category: "Spiritual Art" },
  { title: "Netaji - Freedom Fighter", description: "Another tribute to Subhas Chandra Bose", image: netajiImg, category: "Historical Figures" },
  { title: "Pranab Mukherjee", description: "Former President of India tribute", image: pranabMukherjeeImg, category: "Historical Figures" },
  { title: "Rabindranath Tagore", description: "Nobel laureate poet and philosopher", image: rabiThakurImg, category: "Historical Figures" },
  { title: "Rohit Sharma", description: "Cricket captain and batting maestro", image: rohitSharmaImg, category: "Sports Art" },
  { title: "Rupam Islam", description: "Rock music legend from Bengal", image: rupamIslamImg, category: "Music Artists" },
  { title: "Sanam Puri", description: "MS Paint portrait of the singer", image: sanamPuriImg, category: "Music Artists" },
  { title: "Satyajit Ray", description: "Master filmmaker and storyteller", image: satyajitRayImg, category: "Historical Figures" },
  { title: "Sharodiya", description: "Autumn festival celebration artwork", image: sharodiyaImg, category: "Cultural Art" },
  { title: "Soumitra Chatterjee", description: "Legendary Bengali actor tribute", image: soumitraChatterjeeImg, category: "Cultural Icons" },
  { title: "Sourav Ganguly", description: "Captain of Indian cricket team", image: souravGangulyImg, category: "Sports Art" },
  { title: "Sushant Singh Rajput", description: "Tribute to the talented actor", image: ssrImg, category: "Cultural Icons" },
  { title: "Sumedh", description: "Portrait artwork with artistic flair", image: sumedhImg, category: "Portraits" },
  { title: "Ishwar Chandra Vidyasagar", description: "Social reformer and educator tribute", image: vidyasagarImg, category: "Historical Figures" },
  { title: "Virat Kohli", description: "Cricket superstar and former captain", image: viratKohliImg, category: "Sports Art" },
];