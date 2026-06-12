import { SlashCommandBuilder } from "discord.js";
import { getFromDb, setInDb } from "../../../utils/database.js";

const PLAYER_ROLE_ID = "1512331841179353118";
const FREE_AGENT_ROLE_ID = "1512331925241598062";
const TRANSACTIONS_CHANNEL_ID = "1512328699066978455";

const NBA_TEAMS = [
  { name: "Atlanta Hawks", roleId: "1512517955303379007" },
  { name: "Boston Celtics", roleId: "1512518103861301258" },
  { name: "Brooklyn Nets", roleId: "1512518153601552636" },
  { name: "Charlotte Hornets", roleId: "1512518241413627914" },
  { name: "Chicago Bulls", roleId: "1512518314327277749" },
  { name: "Cleveland Cavaliers", roleId: "1512518366529716225" },
  { name: "Dallas Mavericks", roleId: "1512518548579422258" },
  { name: "Denver Nuggets", roleId: "1512518893502205992" },
  { name: "Detroit Pistons", roleId: "1512932453491151020" },
  { name: "Golden State Warriors", roleId: "1512932556172034180" },
  { name: "Houston Rockets", roleId: "1512932606767792298" },
  { name: "Indiana Pacers", roleId: "1512932703823990845" },
  { name: "LA Clippers", roleId: "1512932788699922523" },
  { name: "Los Angeles Lakers", roleId: "1512932857763594301" },
  { name: "Memphis Grizzlies", roleId: "1512932929540718724" },
  { name: "Miami Heat", roleId: "1512932993751318590" },
  { name: "Milwaukee Bucks", roleId: "1512933063183564860" },
  { name: "Minnesota Timberwolves", roleId: "1512933150328750170" },
  { name: "New Orleans Pelicans", roleId: "1512933198181568653" },
  { name: "New York Knicks", roleId: "1512933266993184898" },
  { name: "Oklahoma City Thunder", roleId: "1512933332818726933" },
  { name: "Orlando Magic", roleId: "1512933391677395075" },
  { name: "Philadelphia 76ers", roleId: "1512933510837567589" },
  { name: "Phoenix Suns", roleId: "1512933553334390844" },
  { name: "Portland Trail Blazers", roleId: "1512933621865124062" },
  { name: "Sacramento Kings", roleId: "1512933667901669437" },
  { name: "San Antonio Spurs", roleId: "1512933740635230269" },
  { name: "Toronto Raptors", roleId: "1512933819299266683" },
  { name: "Utah Jazz", roleId: "1512933864627241111" },
  { name: "Washington Wizards", roleId: "1512933932742611134" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("demand")
    .setDescription("Demand release from your team"),

  async execute(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    const demandKey = `guild:${interaction.guild.id}:demand:${member.id}`;
    const hasDemanded = await getFromDb(demandKey, false);

    if (hasDemanded) {
      return interaction.reply({
        content: "❌ You have already used your one demand.",
        ephemeral: true,
      });
    }

    const currentTeam = NBA_TEAMS.find(team =>
  member.roles.cache.has(team.roleId)
);

if (!member.roles.cache.has(PLAYER_ROLE_ID) || !currentTeam) {
  return interaction.reply({
    content: "❌ Only signed players may use /demand.",
    ephemeral: true,
  });
}

if (member.roles.cache.has(FREE_AGENT_ROLE_ID)) {
  return interaction.reply({
    content: "❌ Free Agents cannot use /demand.",
    ephemeral: true,
  });
}

    const allTeamRoleIds = NBA_TEAMS.map(team => team.roleId);

    try {
      await member.roles.remove([PLAYER_ROLE_ID, ...allTeamRoleIds]);
      await new Promise(resolve => setTimeout(resolve, 500));
      await member.roles.add(FREE_AGENT_ROLE_ID);

      await setInDb(demandKey, true);
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content: "❌ I could not update your roles. Contact league staff.",
        ephemeral: true,
      });
    }

    const transactionsChannel =
      interaction.guild.channels.cache.get(TRANSACTIONS_CHANNEL_ID);

    if (transactionsChannel) {
      await transactionsChannel.send(
        `🚨 **DEMAND:** ${member} has demanded release from **${currentTeam.name}** and is now a Free Agent.`
      );
    }

    return interaction.reply({
      content: `🚨 You have demanded release from **${currentTeam.name}** and are now a Free Agent.`,
      ephemeral: true,
    });
  },
};
