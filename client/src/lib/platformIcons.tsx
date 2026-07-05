import { Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Mail, ExternalLink, Globe } from "lucide-react";
import { SiLinkedin, SiGithub, SiX, SiInstagram, SiFacebook, SiYoutube, SiDiscord, SiTelegram, SiWhatsapp, SiTiktok, SiSnapchat, SiPinterest, SiReddit, SiStackoverflow, SiMedium, SiHashnode, SiDevdotto, SiCodepen, SiFigma, SiBehance, SiDribbble, SiSlack, SiSpotify, SiTwitch, SiGeeksforgeeks, SiLeetcode, SiHackerrank, SiCodechef, SiGitlab, SiReplit, SiKaggle, SiGoogle } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";

// Platform detection patterns
const platformPatterns = [
  { name: 'linkedin', patterns: ['linkedin.com', 'linkedin'], icon: <SiLinkedin className="h-5 w-5" /> },
  { name: 'github', patterns: ['github.com', 'github'], icon: <SiGithub className="h-5 w-5" /> },
  { name: 'twitter', patterns: ['twitter.com', 'x.com', 'twitter'], icon: <SiX className="h-5 w-5" /> },
  { name: 'instagram', patterns: ['instagram.com', 'instagram'], icon: <SiInstagram className="h-5 w-5" /> },
  { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'facebook'], icon: <SiFacebook className="h-5 w-5" /> },
  { name: 'youtube', patterns: ['youtube.com', 'youtu.be', 'youtube'], icon: <SiYoutube className="h-5 w-5" /> },
  { name: 'discord', patterns: ['discord.gg', 'discord.com', 'discord'], icon: <SiDiscord className="h-5 w-5" /> },
  { name: 'telegram', patterns: ['t.me', 'telegram.me', 'telegram'], icon: <SiTelegram className="h-5 w-5" /> },
  { name: 'whatsapp', patterns: ['wa.me', 'whatsapp.com', 'whatsapp'], icon: <SiWhatsapp className="h-5 w-5" /> },
  { name: 'tiktok', patterns: ['tiktok.com', 'tiktok'], icon: <SiTiktok className="h-5 w-5" /> },
  { name: 'snapchat', patterns: ['snapchat.com', 'snapchat'], icon: <SiSnapchat className="h-5 w-5" /> },
  { name: 'pinterest', patterns: ['pinterest.com', 'pinterest'], icon: <SiPinterest className="h-5 w-5" /> },
  { name: 'reddit', patterns: ['reddit.com', 'reddit'], icon: <SiReddit className="h-5 w-5" /> },
  { name: 'stackoverflow', patterns: ['stackoverflow.com', 'stackoverflow'], icon: <SiStackoverflow className="h-5 w-5" /> },
  { name: 'medium', patterns: ['medium.com', 'medium'], icon: <SiMedium className="h-5 w-5" /> },
  { name: 'hashnode', patterns: ['hashnode.com', 'hashnode'], icon: <SiHashnode className="h-5 w-5" /> },
  { name: 'dev', patterns: ['dev.to', 'dev'], icon: <SiDevdotto className="h-5 w-5" /> },
  { name: 'codepen', patterns: ['codepen.io', 'codepen'], icon: <SiCodepen className="h-5 w-5" /> },
  { name: 'figma', patterns: ['figma.com', 'figma'], icon: <SiFigma className="h-5 w-5" /> },
  { name: 'behance', patterns: ['behance.net', 'behance'], icon: <SiBehance className="h-5 w-5" /> },
  { name: 'dribbble', patterns: ['dribbble.com', 'dribbble'], icon: <SiDribbble className="h-5 w-5" /> },
  { name: 'slack', patterns: ['slack.com', 'slack'], icon: <SiSlack className="h-5 w-5" /> },
  { name: 'spotify', patterns: ['spotify.com', 'spotify'], icon: <SiSpotify className="h-5 w-5" /> },
  { name: 'twitch', patterns: ['twitch.tv', 'twitch'], icon: <SiTwitch className="h-5 w-5" /> },
  { name: 'geeksforgeeks', patterns: ['geeksforgeeks.org', 'gfg', 'geeksforgeeks'], icon: <SiGeeksforgeeks className="h-5 w-5" /> },
  { name: 'leetcode', patterns: ['leetcode.com', 'leetcode'], icon: <SiLeetcode className="h-5 w-5" /> },
  { name: 'hackerrank', patterns: ['hackerrank.com', 'hackerrank'], icon: <SiHackerrank className="h-5 w-5" /> },
  { name: 'codechef', patterns: ['codechef.com', 'codechef'], icon: <SiCodechef className="h-5 w-5" /> },
  { name: 'gitlab', patterns: ['gitlab.com', 'gitlab'], icon: <SiGitlab className="h-5 w-5" /> },
  { name: 'replit', patterns: ['replit.com', 'repl.it', 'replit'], icon: <SiReplit className="h-5 w-5" /> },
  { name: 'kaggle', patterns: ['kaggle.com', 'kaggle'], icon: <SiKaggle className="h-5 w-5" /> },
  { name: 'google', patterns: ['google.com', 'google'], icon: <SiGoogle className="h-5 w-5" /> },
  { name: 'email', patterns: ['mailto:', 'email'], icon: <Mail className="h-5 w-5" /> },
  { name: 'website', patterns: ['http://', 'https://', 'www.'], icon: <Globe className="h-5 w-5" /> },
];

/**
 * Automatically detects platform from URL or platform name and returns appropriate icon
 */
export function getAutomaticPlatformIcon(url: string, platformName?: string): { icon: JSX.Element; detectedPlatform: string } {
  const searchText = `${url} ${platformName || ''}`.toLowerCase();
  
  // Try to find a matching platform
  for (const platform of platformPatterns) {
    for (const pattern of platform.patterns) {
      if (searchText.includes(pattern)) {
        return {
          icon: platform.icon,
          detectedPlatform: platform.name
        };
      }
    }
  }
  
  // Default fallback icon
  return {
    icon: <ExternalLink className="h-5 w-5" />,
    detectedPlatform: 'external'
  };
}

/**
 * Returns icon for a specific platform name
 */
export function getPlatformIconByName(platformName: string): JSX.Element {
  const platform = platformPatterns.find(p => 
    p.name.toLowerCase() === platformName.toLowerCase() ||
    p.patterns.some(pattern => pattern.includes(platformName.toLowerCase()))
  );
  
  return platform?.icon || <ExternalLink className="h-5 w-5" />;
}

/**
 * Gets platform name from URL
 */
export function detectPlatformFromUrl(url: string): string {
  const lowerUrl = url.toLowerCase();
  
  for (const platform of platformPatterns) {
    for (const pattern of platform.patterns) {
      if (lowerUrl.includes(pattern)) {
        return platform.name;
      }
    }
  }
  
  return 'external';
}

/**
 * Returns all available platforms for selection
 */
export function getAvailablePlatforms() {
  return platformPatterns.map(platform => ({
    name: platform.name,
    displayName: platform.name.charAt(0).toUpperCase() + platform.name.slice(1),
    icon: platform.icon
  }));
}