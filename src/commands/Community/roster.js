import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

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
    .setName("roster")
    .setDescription("View a team's roster")
    .addStringOption(option =>
      option
        .setName("team")
        .setDescription("Example: New York Knicks")
        .setRequired(true)
    ),

  async execute(interaction) {
    const teamName = interaction.options.getString("team");

    const team = NBA_TEAMS.find(
      t => t.name.toLowerCase() === teamName.toLowerCase()
    );

    if (!team) {
      return interaction.reply({
        content: "❌ Team not found. Example: New York Knicks",
        ephemeral: true,
      });
    }

    const role = interaction.guild.roles.cache.get(team.roleId);

    if (!role) {
      return interaction.reply({
        content: "❌ Team role not found.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    await interaction.guild.members.fetch();

    const members = interaction.guild.members.cache
      .filter(member => member.roles.cache.has(team.roleId))
      .sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );

    const rosterList =
  [...members.values()]
    .map((member, index) => `${index + 1}. ${member}`)
    .join("\n") || "No players on this roster.";

    const embed = new EmbedBuilder()
      .setTitle(`🏀 ${team.name} Roster`)
      .setDescription(rosterList)
      .setColor("#0099ff")
      .setFooter({
        text: `Roster Count: ${members.size}/15`,
      });

    return interaction.editReply({
      embeds: [embed],
    });
  },
};
