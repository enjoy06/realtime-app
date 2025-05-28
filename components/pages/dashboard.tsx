"use client";

import { Card, CardContent } from "@/components/ui/card";
import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import { FaAlipay, FaArrowDownLong, FaArrowPointer, FaArrowRightLong, FaArrowRotateRight, FaArrowTurnUp, FaComputer, FaFlutter, FaICursor, FaRegHeart } from "react-icons/fa6";
import { RiSmartphoneLine } from "react-icons/ri";
import { FcBbc, FcBookmark, FcBullish, FcBusiness, FcCableRelease, FcCallTransfer, FcCloseUpMode, FcDisplay, FcFlashOn, FcInfo, FcMultipleDevices } from "react-icons/fc";
import TopCountryChart from "@/components/chart/TopCountryChart";
import { ClientDate } from "./clientDate";
import { SetStateAction, use, useState } from "react";
import { Clock, Cpu, DollarSign, EarthLock, Eye, MapPin, Minimize2, User, Wifi, X } from "lucide-react";
import axios from "axios";

// Types
interface Click {
  id: string;
  user: string;
  country: string;
  source: string;
  gadget: string;
  ip: string;
  created_at: Date;
}

interface TopLead {
  name: string;
  total: number;
}

interface Lead {
  id: string;
  userId: string;
  country: string;
  useragent: string;
  ip: string;
  earning: number;
  created_at: any;
}

interface User {
  username: string;
  sum: number;
}

interface DashboardData {
  clicks: Click[];
  liveClicks: Click[];
  topUsers: User[];
  leads: Lead[];
  countryData: Record<string, number>;
  topLeads: TopLead[];
}

//cek info!
interface IPInfo {
  ip: string;
  success: boolean;
  type: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
  is_eu: boolean;
  postal: string;
  calling_code: string;
  capital: string;
  borders: string;
  flag: {
    img: string;
    emoji: string;
    emoji_unicode: string;
  };
  connection: {
    asn: number;
    org: string;
    isp: string;
    domain: string;
  };
  timezone: {
    id: string;
    abbr: string;
    is_dst: boolean;
    offset: number;
    utc: string;
    current_time: string;
  };
  currency: {
    name: string;
    code: string;
    symbol: string;
    plural: string;
    exchange_rate: number;
  };
  security: {
    anonymous: boolean;
    proxy: boolean;
    vpn: boolean;
    tor: boolean;
    hosting: boolean;
  };
}

export function RealtimeTab({ data }: { data: DashboardData }) {

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLiveClick, setSelectedLiveClick] = useState<Click | null>(null);
  const [isOpenLiveClick, setIsOpenLiveClick] = useState(false);
  const [whatIsMyIP, setWhatIsMyIP] = useState<IPInfo | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  
  const filteredLeads = data.leads.filter((lead) =>
    lead.userId.toLowerCase().includes(searchUser.toLowerCase()) &&
    lead.country.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const getIPinfo = async (ip : string) => {

    await axios.get(`https://ipwhois.pro/${ip}`,{
      params: {
        key: 'rmpJxy6jV0iWmWZu'
      }
    }).then((result)=>{
      //console.log(result);
      if (result && result.data) {
        setWhatIsMyIP(result.data);
      }
    });

  };

  const openModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedLead(null);
  };

  const showLiveCLicksInfo = (click: Click) => {
    getIPinfo(click.ip);
    setSelectedLiveClick(click);
    setIsOpenLiveClick(true);
  };

  const closeInfoLiveClick = () => {
    setIsOpenLiveClick(false);
    setSelectedLiveClick(null);
  };

  return (
    <div className="pt-0 space-y-6">
      {/* Live Clicks & Top Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live Clicks */}
        <Card className="rounded-2xl shadow-lg col-span-1 md:col-span-2 lg:col-span-2 w-full 
          bg-gradient-to-r from-lime-50 via-lime-100 to-orange-200 dark:text-white dark:bg-gradient-to-r 
          dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
          hover:bg-gradient-to-r hover:from-red-100 hover:via-red-50 hover:to-cyan-200
          dark:hover:bg-gradient-to-r dark:hover:from-zinc-900 dark:hover:via-zinc-700 dark:hover:to-zinc-900
          max-h-[400px] overflow-auto"
        >
          <div className="flex items-start justify-start gap-2 mb-6 p-0">
          <FaArrowPointer className="text-2xl text-blue-500 animate-pulse" />
          <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Live Clicks</h2>
          </div>

          {/* live clicks content */}
          <div className="p-4 pt-0">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {[...data.liveClicks]
                .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
                .slice(0, 15)
                .map((click) => (
                  <div
                    key={click.id}
                    className="live-clicks-row animate-pulse flex flex-wrap items-center gap-x-2 gap-y-1"
                    onClick={()=>showLiveCLicksInfo(click)}
                  >
                    {/* Flag */}
                    <div className="flex-shrink-0 w-7">
                      <ReactCountryFlag
                        countryCode={click.country || "XX"}
                        svg
                        style={{
                          width: "auto",
                          height: "1.2rem",
                          borderRadius: "3px",
                          boxShadow: "0 0 2px rgba(0,0,0,0.15)",
                        }}
                        title={click.country}
                      />
                    </div>

                    {/* User */}
                    <div className="flex-grow font-mono text-cyan-500 dark:text-teal-300 text-sm truncate max-w-[100px]">
                      {click.user}
                    </div>

                    {/* Device Icon */}
                    <div className="flex-shrink-0 w-6 text-lg">
                      {click.source.match(
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/
                      ) ? (
                        <RiSmartphoneLine />
                      ) : (
                        <FaComputer />
                      )}
                    </div>

                    {/* IP */}
                    <div className="flex-grow font-serif text-zinc-600 dark:text-teal-300 text-xs truncate max-w-[110px]">
                      {click.ip}
                    </div>

                    {/* Browser Icon */}
                    <div className="flex-shrink-0 w-6 text-center text-2xl text-zinc-500 px-1">
                      {click.gadget.includes("chrome") && (
                        <Image src={"/safari.svg"} alt="Browser Icon" width={20} height={20} />
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* show live click when clicked! */}
            {isOpenLiveClick && selectedLiveClick && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                <div 
                  className="
                  bg-white dark:bg-zinc-900 rounded-3xl shadow-xl 
                    max-w-sm w-full p-6 relative animate-fade-in-scale
                    mx-6 sm:mx-auto sm:max-w-md
                    max-h-[90vh] overflow-auto"
                  style={{ animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                >
                  {/* Close button */}
                  <button
                    onClick={closeInfoLiveClick}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-red-600 dark:text-zinc-300" />
                  </button>

                  {/* Information Dialog */}
                  <h2 className="text-1xl font-mono mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                    <FcFlashOn />
                    Click: {whatIsMyIP?.country}
                  </h2>

                  {/* Details list */}
                  <div className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm">
                    {/* User */}
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">
                        {selectedLiveClick?.user}
                      </span>
                    </div>
                    
                    {/* IP */}
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      {/* <strong>IP Address:</strong> */}
                      <span className="font-mono">
                        {selectedLiveClick.ip}
                      </span>
                    </div>

                    {/* Device */}
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-indigo-500" />
                      {/* <strong>Device:</strong> */}
                      <span className="font-serif">
                        {selectedLiveClick.gadget.toUpperCase()}
                      </span>
                    </div>

                    {/* Full info */}
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="font-mono text-wrap">
                      {whatIsMyIP?.city}, {whatIsMyIP?.region}, {whatIsMyIP?.postal}
                      </span>
                    </div>

                    {/* Koneksi? */}
                    <div className="flex items-center space-x-2">
                      <EarthLock className="w-4 h-4 text-red-500" />
                      <span>
                        {whatIsMyIP?.connection.isp}
                      </span>
                    </div>

                    {/* UA */}
                    <div className="flex items-center space-x-2 text-wrap">
                      <span className="font-mono">
                        {/* <Eye className="w-4 h-auto text-purple-500" /> */}
                         {selectedLiveClick.source}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </Card>

        {/* Top Users */}
        <Card className="rounded-2xl shadow-lg hidden lg:block 
          bg-gradient-to-r from-lime-50 via-lime-100 to-orange-200 dark:bg-gradient-to-r 
          hover:bg-gradient-to-r hover:from-cyan-200 hover:via-red-50 hover:to-red-100
          dark:hover:bg-gradient-to-r dark:hover:from-zinc-900 dark:hover:via-zinc-700 dark:hover:to-zinc-900"
        >
          <div className="p-6">
            <h2 className="font-semibold text-xl text-zinc-800 dark:text-white mb-2">Top Users</h2>
            {data.topUsers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No top users found.</p>
            ) : (
              <ul className="space-y-1 mt-2 text-zinc-700 dark:text-zinc-200">
                {data.topUsers.slice(0, 3).map((user, i) => (
                  <li key={i}>
                    <span className="font-semibold text-blue-500">{i + 1}.</span> {user.username}{" "}
                    <span className="text-sm text-zinc-500">(${user.sum})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Quote */}
      {/* <div className="w-full">
        <div className="float-left mb-4 
          bg-blue-100 dark:bg-blue-900 text-blue-800 
          dark:text-blue-200 px-4 py-2 rounded-xl shadow-sm 
          border border-blue-300 dark:border-blue-700 text-sm font-serif text-nowrap"
        >
          ❤️ Madepo lee...
        </div>
      </div>
      <div className="clear-left" /> */}
      {/* <div className="w-full">
      <div
        className="inline-flex items-center gap-2 mb-0 
          bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200
          px-4 py-2 rounded-xl shadow-sm border border-blue-300 dark:border-blue-700
          text-sm font-serif transition-all duration-300 max-w-full"
      >
        <FcInfo className="animate-pulse" />
        <span className="whitespace-pre-wrap">Ayo ...ayo .. ayo ... gaskeun..........................!
        </span>
      </div>
    </div> */}

    {/* Search Input */}
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
    <input
      type="text"
      placeholder="Search user?"
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      className="rounded-md border border-zinc-300
      dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      type="text"
      placeholder="Country? : US, DE, UK"
      value={searchCountry}
      onChange={(e) => setSearchCountry(e.target.value)}
      className="rounded-md border border-zinc-300 
      dark:border-zinc-600 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

    {/* Table */}
    <div className="overflow-x-auto rounded-xl shadow-md mt-4 border border-zinc-200 dark:border-zinc-700">
        
        <table className="table-auto min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
            <thead className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">User</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Country</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Source</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap hidden md:table-cell">IP</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Earning</th>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap hidden sm:table-cell">Time</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center px-4 py-6 text-zinc-500 dark:text-zinc-400 italic">
                  No Leads today..
                </td>
              </tr>
            ) : ( filteredLeads.map((lead) => (
                // <tr key={lead.id} className="odd:bg-cyan-100 even:bg-cyan-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition">
                <tr
                  key={lead.id}
                  className="cursor-pointer odd:bg-cyan-100 even:bg-cyan-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                  onClick={() => openModal(lead)}
                >

                {/* UserId */}
                <td className="px-4 py-2 font-serif text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                    {lead.userId}
                </td>
                {/* Country */}
                <td className="px-4 py-2 whitespace-nowrap text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <ReactCountryFlag
                    countryCode={lead.country || "XX"}
                    svg
                    style={{ width: "1.5em", height: "1em", borderRadius: "3px", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
                    title={lead.country}
                    />
                    <span className="hidden sm:inline">{lead.country}</span>
                </td>
                {/* Source */}
                <td className="px-4 py-2 text-2xl whitespace-nowrap">
                    {lead.useragent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/g) ? (
                    <RiSmartphoneLine />
                    ) : (
                    <FaComputer />
                    )}
                </td>
                {/* IP Address */}
                <td className="px-4 py-2 font-mono text-zinc-800 dark:text-zinc-100 whitespace-nowrap  hidden md:table-cell">
                    {lead.ip}
                </td>
                {/* Earning */}
                <td className="px-4 py-2 font-mono font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                    ${lead.earning.toFixed(2)}
                </td>
                {/* Time */}
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap hidden sm:table-cell">
                    <ClientDate date={lead.created_at} />
                </td>
                </tr>
              ))
            )}
            </tbody>
        </table>

        {/* show information */}
        {isOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div 
            className="
            bg-white dark:bg-zinc-900 rounded-3xl shadow-xl 
              max-w-sm w-full p-6 relative animate-fade-in-scale
              mx-6 sm:mx-auto sm:max-w-md
              max-h-[90vh] overflow-auto"
            style={{ animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-mono mb-6 text-zinc-900 dark:text-white">
              INFORMASI LEAD
            </h2>

            {/* Details list */}
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-500" />
                <span><strong>User ID:</strong> {selectedLead.userId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span><strong>Country:</strong> {selectedLead.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-green-500" />
                <span><strong>IP Address:</strong> {selectedLead.ip}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span><strong>Earning:</strong> ${selectedLead.earning.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span><strong>Device:</strong> {selectedLead.useragent}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span><strong>Time:</strong> <ClientDate date={selectedLead.created_at} /></span>
              </div>
            </div>
          </div>
        </div>
        )}

    </div>

    {/* Chart & Top Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Top Country Chart */}
        <TopCountryChart countryData={data.countryData} />
        {/* Top Leads */}
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-cyan-50 via-cyan-100 to-blue-200 
            dark:bg-gradient-to-r dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-700
            hover:bg-gradient-to-r hover:from-blue-300 hover:via-cyan-200 hover:to-cyan-100
            dark:hover:bg-gradient-to-r dark:hover:from-slate-900 dark:hover:via-slate-800 dark:hover:to-slate-950"
        >
        <div className="flex items-start justify-start gap-2 mb-4 p-0">
          <FcFlashOn className="text-2xl text-blue-500 animate-pulse" />
          <h2 className="font-mono text-1xl text-zinc-800 dark:text-white">Top Leads</h2>
        </div>
          <CardContent className="p-6">
            {data.topLeads.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-white-400">No leads available.</p>
            ) : (
              <ul className="font-mono text-1xl space-y-1 text-zinc-700 dark:text-white">
                {data.topLeads.map((lead, i) => (
                  <li key={i}>
                    {i + 1}. {lead.name} - ${lead.total.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}